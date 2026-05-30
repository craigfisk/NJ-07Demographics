import { renderHook, act } from '@testing-library/react';
import { useUrlDatabase } from './useUrlDatabase';
import { describe, it, expect } from 'vitest';

describe('useUrlDatabase', () => {
    it('should add a URL', () => {
        const { result } = renderHook(() => useUrlDatabase());
        act(() => {
            result.current.addUrl('https://example.com');
        });
        expect(result.current.urls).toContain('https://example.com');
        expect(result.current.currentUrl).toBe('https://example.com');
    });

    it('should maintain order', () => {
        const { result } = renderHook(() => useUrlDatabase());
        act(() => {
            result.current.addUrl('url1');
            result.current.addUrl('url2');
        });
        expect(result.current.urls).toEqual(['url2', 'url1']);
        expect(result.current.currentUrl).toBe('url2');
    });

    it('should select an existing URL and move to top', () => {
        const { result } = renderHook(() => useUrlDatabase());
        act(() => {
            result.current.addUrl('url1');
            result.current.addUrl('url2');
            result.current.selectUrl('url1');
        });
        expect(result.current.urls).toEqual(['url1', 'url2']);
        expect(result.current.currentUrl).toBe('url1');
    });
});
