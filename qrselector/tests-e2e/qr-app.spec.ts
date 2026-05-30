import { test, expect } from '@playwright/test';

test('has correct header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('QR URL Selector');
});

test('adds and selects a URL', async ({ page }) => {
  await page.goto('/');
  
  // Add first URL
  await page.fill('input', 'https://google.com');
  await page.click('button:has-text("Add")');
  
  // Add second URL
  await page.fill('input', 'https://github.com');
  await page.click('button:has-text("Add")');
  
  // Verify github is on top
  const listItems = page.locator('ul li');
  await expect(listItems.first()).toHaveText('https://github.com');
  
  // Select google
  await page.click('text=https://google.com');
  
  // Verify google is now on top
  await expect(listItems.first()).toHaveText('https://google.com');
});
