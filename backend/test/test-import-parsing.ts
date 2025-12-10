
import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mocking the helper function we plan to implement
function parseGermanFloat(value: string | undefined): number {
    if (!value) return 0;
    // Remove any currency symbols and whitespace
    let cleaned = value.replace(/[€$£\s]/g, '');

    // Check if it uses comma as decimal separator (German format: 1.234,56 or 12,34)
    if (cleaned.includes(',') && !cleaned.includes('.')) {
        // Simple case: 12,34 -> 12.34
        cleaned = cleaned.replace(',', '.');
    } else if (cleaned.includes('.') && cleaned.includes(',')) {
        // Mixed case: 1.234,56 (German) or 1,234.56 (US)
        // If last separator is comma, it's likely German decimal
        const lastComma = cleaned.lastIndexOf(',');
        const lastDot = cleaned.lastIndexOf('.');

        if (lastComma > lastDot) {
            // German: 1.234,56 -> 1234.56
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // US: 1,234.56 -> 1234.56
            cleaned = cleaned.replace(/,/g, '');
        }
    }

    return parseFloat(cleaned) || 0;
}

describe('German Float Parsing', () => {
    it('should parse simple German decimal', () => {
        assert.strictEqual(parseGermanFloat('12,99'), 12.99);
    });

    it('should parse German thousands separator', () => {
        assert.strictEqual(parseGermanFloat('1.234,56'), 1234.56);
    });

    it('should parse simple US decimal', () => {
        assert.strictEqual(parseGermanFloat('12.99'), 12.99);
    });

    it('should parse US thousands separator', () => {
        assert.strictEqual(parseGermanFloat('1,234.56'), 1234.56);
    });

    it('should handle currency symbols', () => {
        assert.strictEqual(parseGermanFloat('€ 12,99'), 12.99);
        assert.strictEqual(parseGermanFloat('12,99 €'), 12.99);
    });

    it('should handle empty or invalid input', () => {
        assert.strictEqual(parseGermanFloat(''), 0);
        assert.strictEqual(parseGermanFloat(undefined), 0);
        assert.strictEqual(parseGermanFloat('abc'), 0);
    });
});
