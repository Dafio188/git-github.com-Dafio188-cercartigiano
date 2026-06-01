import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getJobBudgetRange(job: { budgetMin?: number; budgetMax?: number; category?: string; metadata?: any }) {
  let bMin = job.budgetMin;
  let bMax = job.budgetMax;
  if (bMin === undefined || bMin === null || isNaN(Number(bMin)) || Number(bMin) === 0) {
    const budgetRange = job.metadata?.budget_range;
    if (budgetRange === 'small') {
      bMin = 50;
      bMax = 150;
    } else if (budgetRange === 'medium') {
      bMin = 150;
      bMax = 500;
    } else if (budgetRange === 'large') {
      bMin = 500;
      bMax = 2000;
    } else if (budgetRange === 'pro') {
      bMin = 2000;
      bMax = 10000;
    } else {
      if (job.category === 'electrical') {
        bMin = 80;
        bMax = 400;
      } else if (job.category === 'plumbing') {
        bMin = 150;
        bMax = 600;
      } else if (job.category === 'construction') {
        bMin = 1000;
        bMax = 5000;
      } else if (job.category === 'cleaning') {
        bMin = 50;
        bMax = 250;
      } else {
        bMin = 100;
        bMax = 800;
      }
    }
  }
  return { min: bMin, max: bMax };
}
