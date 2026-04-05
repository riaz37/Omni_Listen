import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('vitest setup', () => {
  it('renders a basic element', () => {
    render(<div>Hello Syncho</div>)
    expect(screen.getByText('Hello Syncho')).toBeInTheDocument()
  })
})
