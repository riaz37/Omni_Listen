'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import Navigation from '@/components/Navigation';
import Pagination from '@/components/Pagination';
import { MessageSquare, Calendar, Search, ExternalLink, Loader2, Filter, Copy, Download, ChevronDown, ChevronUp, ArrowUpDown, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { exportQueriesToPDF } from '@/lib/export';

interface QueryResult {
  meetingId: string;
  meetingDate: Date;
  question: string;
  answer: string;
  type: string; // Type from Gemini: summary, analysis, list, comparison, search, question
}

export default function QueriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [queries, setQueries] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    } else if (user) {
      fetchQueries();
    }
  }, [user, authLoading, router]);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const meetings = await meetingsAPI.getAllMeetings();
      const allQueries: QueryResult[] = [];

      meetings.forEach((meeting: any) => {
        if (meeting.user_input && meeting.user_input_result) {
          const result = typeof meeting.user_input_result === 'string'
            ? JSON.parse(meeting.user_input_result)
            : meeting.user_input_result;

          allQueries.push({
            meetingId: meeting.job_id,
            meetingDate: new Date(meeting.created_at),
            question: meeting.user_input,
            answer: result.content || result.description || 'No answer available',
            type: result.type || 'analysis', // Gemini provides type: summary, analysis, list, etc.
          });
        }
      });

      // Sort by date (newest first)
      allQueries.sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime());
      setQueries(allQueries);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Type', 'Question', 'Answer'].join(','),
      ...filteredQueries.map(q => [
        format(q.meetingDate, 'yyyy-MM-dd HH:mm'),
        q.type,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queries_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredQueries = useMemo(() => {
    let filtered = queries.filter(
      (query) =>
        (filterType === 'all' || query.type === filterType) &&
        (searchTerm === '' ||
          query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime());
    } else {
      filtered.sort((a, b) => a.meetingDate.getTime() - b.meetingDate.getTime());
    }

    return filtered;
  }, [queries, searchTerm, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQueries = filteredQueries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Stats
  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    queries.forEach(q => {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    });
    return typeCounts;
  }, [queries]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Additional Analysis History</h1>
              </div>
              <p className="text-muted-foreground">
                {queries.length} total analysis • {filteredQueries.length} shown
              </p>
            </div>
            {queries.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => exportQueriesToPDF(filteredQueries)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Download PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {queries.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Analysis Statistics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats).map(([type, count]) => {
                  const typeConfig = {
                    summary: { label: 'Summary', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
                    analysis: { label: 'Analysis', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700' },
                    list: { label: 'List', color: 'bg-primary/10 text-text-primary border-primary/30' },
                    comparison: { label: 'Comparison', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
                    search: { label: 'Search', color: 'bg-primary/10 text-text-primary border-primary/30' },
                    question: { label: 'Question', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700' },
                  };
                  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.analysis;
                  return (
                    <span key={type} className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                      {config.label}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search additional analysis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="summary">Summary</option>
                <option value="analysis">Analysis</option>
                <option value="list">List</option>
                <option value="comparison">Comparison</option>
                <option value="search">Search</option>
                <option value="question">Question</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queries List */}
        {filteredQueries.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? 'No analysis found' : 'No analysis yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start asking questions when processing meetings to see them here'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedQueries.map((query, index) => {
                // Map type to display label and color
                const typeConfig = {
                  summary: { label: 'SUMMARY', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700', gradient: 'from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30' },
                  analysis: { label: 'ANALYSIS', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700', gradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30' },
                  list: { label: 'LIST', color: 'bg-primary/10 text-text-primary border-primary/20', gradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' },
                  comparison: { label: 'COMPARISON', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700', gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30' },
                  search: { label: 'SEARCH', color: 'bg-primary/10 text-text-primary border-primary/20', gradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' },
                  question: { label: 'QUESTION', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700', gradient: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30' },
                };
                const config = typeConfig[query.type as keyof typeof typeConfig] || typeConfig.analysis;
                const globalIndex = startIndex + index;
                const isExpanded = expandedIndex === globalIndex;
                const answerPreview = query.answer.length > 200 ? query.answer.substring(0, 200) + '...' : query.answer;
                const needsExpand = query.answer.length > 200;

                return (
                  <div
                    key={globalIndex}
                    className={`bg-gradient-to-br ${config.gradient} rounded-lg shadow-sm border-2 border-border p-6 hover:shadow-lg transition-all duration-200`}
                  >
                    {/* Meeting Info & Type Badge */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{format(query.meetingDate, 'MMM dd, yyyy • h:mm a')}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => router.push(`/meeting?id=${query.meetingId}`)}
                        className="ml-auto text-primary hover:text-text-primary font-medium flex items-center gap-1 hover:underline"
                      >
                        View Meeting
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Analysis Request Input */}
                    <div className="mb-4 bg-card/60 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wide">
                          ✨ Your Analysis Request
                        </div>
                        <button
                          onClick={() => copyToClipboard(query.question, globalIndex * 2)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Copy request"
                        >
                          {copiedIndex === globalIndex * 2 ? (
                            <span className="text-xs text-primary font-medium">✓ Copied</span>
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-foreground font-medium">
                        {query.question}
                      </div>
                    </div>

                    {/* Result */}
                    <div className="bg-card rounded-lg p-4 border-2 border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wide">
                          💡 AI Analysis
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(query.answer, globalIndex * 2 + 1)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Copy answer"
                          >
                            {copiedIndex === globalIndex * 2 + 1 ? (
                              <span className="text-xs text-primary font-medium">✓ Copied</span>
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          {needsExpand && (
                            <button
                              onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  <span className="text-xs font-medium">Show less</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  <span className="text-xs font-medium">Show more</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-foreground whitespace-pre-wrap">
                        {isExpanded || !needsExpand ? query.answer : answerPreview}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredQueries.length > 10 && (
              <div className="mt-6 bg-card rounded-lg shadow-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredQueries.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
