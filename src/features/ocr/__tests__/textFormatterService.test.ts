import { describe, it, expect } from 'vitest';
import { formatText } from '../services/textFormatterService';

describe('textFormatterService', () => {
  it('should trim whitespace and remove excessive newlines', () => {
    // Arrange: create some messy text
    const messyText = "  Hello \n\n\n World  ";
    
    // Act: run it through your service
    const cleanText = formatText(messyText);
    
    // Assert: check if it cleaned it up properly
    expect(cleanText).toBe("Hello \n World");
  });
});