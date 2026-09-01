import { AffiliatePlatformId, AffiliateTransactionStatus } from '../../../common/constants';
import {
  AFFILIATE_PLATFORMS,
  getAffiliatePlatform,
  TRANSACTION_STATUS_META,
} from '../config/affiliate.config';
import { AffiliatePlatformConnectionDocument } from '../schemas/affiliate-platform-connection.schema';
import { AffiliateTransactionDocument } from '../schemas/affiliate-transaction.schema';

export function buildPagination(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function generateAffiliateId() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `ew_aff_${suffix}`;
}

export function buildShortCode(affiliateTag: string, userId?: string) {
  const sanitized = affiliateTag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const base =
    sanitized.length >= 4
      ? sanitized.slice(0, 20)
      : `link${Math.random().toString(36).slice(2, 8)}`;
  const suffix = userId ? userId.slice(-6).toLowerCase() : '';
  return `${base}${suffix}`;
}

export function buildGeneratedLink(
  platformId: AffiliatePlatformId,
  affiliateTag: string,
  productUrl?: string,
) {
  const platform = getAffiliatePlatform(platformId);
  if (!platform) return '';

  if (productUrl) {
    const separator = productUrl.includes('?') ? '&' : '?';
    if (platformId === AffiliatePlatformId.AMAZON) {
      return `${productUrl}${separator}tag=${encodeURIComponent(affiliateTag)}`;
    }
    if (platformId === AffiliatePlatformId.FLIPKART) {
      return `${productUrl}${separator}affid=${encodeURIComponent(affiliateTag)}`;
    }
    if (platformId === AffiliatePlatformId.BIGBASKET) {
      return `${productUrl}${separator}ref=${encodeURIComponent(affiliateTag)}`;
    }
    return `${productUrl}${separator}aff=${encodeURIComponent(affiliateTag)}`;
  }

  return `${platform.linkPrefix}${affiliateTag}`;
}

export function formatPeriodLabel(date: Date) {
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getNextPayoutDate(reference = new Date()) {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
}

export function calculateConversionRate(totalOrders: number, totalClicks: number) {
  if (totalClicks === 0) return 0;
  return roundCurrency((totalOrders / totalClicks) * 100);
}

export function sumEarningsByStatus(
  transactions: AffiliateTransactionDocument[],
  status: AffiliateTransactionStatus,
) {
  return roundCurrency(
    transactions
      .filter((transaction) => transaction.status === status)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
}

export function getThisMonthEarnings(transactions: AffiliateTransactionDocument[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return roundCurrency(
    transactions
      .filter((transaction) => transaction.createdAt && transaction.createdAt >= monthStart)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
}

export function getLastPaidDate(transactions: AffiliateTransactionDocument[]) {
  const paid = transactions
    .filter(
      (transaction) =>
        transaction.status === AffiliateTransactionStatus.PAID && transaction.paidAt,
    )
    .sort((a, b) => b.paidAt!.getTime() - a.paidAt!.getTime());

  return paid[0]?.paidAt ? formatDateOnly(paid[0].paidAt) : null;
}

export function toPlatformConnectionResponse(connection: AffiliatePlatformConnectionDocument) {
  const platform = getAffiliatePlatform(connection.platformId);

  return {
    platformId: connection.platformId,
    platformName: platform?.name ?? connection.platformId,
    affiliateTag: connection.affiliateTag,
    isVerified: connection.isVerified,
    totalEarned: roundCurrency(connection.totalEarned),
    totalClicks: connection.totalClicks,
  };
}

export function toTransactionResponse(transaction: AffiliateTransactionDocument) {
  const platform = getAffiliatePlatform(transaction.platformId);
  const meta = TRANSACTION_STATUS_META[transaction.status];

  return {
    transactionId: transaction._id.toString(),
    platformId: transaction.platformId,
    platformName: platform?.name ?? transaction.platformId,
    amount: roundCurrency(transaction.amount),
    currency: transaction.currency,
    status: transaction.status,
    statusLabel: meta.label,
    statusColor: meta.color,
    ordersCount: transaction.ordersCount,
    clicksCount: transaction.clicksCount,
    periodLabel: formatPeriodLabel(transaction.periodStart),
    periodStart: formatDateOnly(transaction.periodStart),
    periodEnd: formatDateOnly(transaction.periodEnd),
    paidAt: transaction.paidAt ?? null,
  };
}

export function getPlatformsResponse() {
  return AFFILIATE_PLATFORMS.map((platform) => ({
    platformId: platform.platformId,
    name: platform.name,
    logoUrl: platform.logoUrl,
    linkPrefix: platform.linkPrefix,
    commissionRate: platform.commissionRate,
    isAvailable: platform.isAvailable,
  }));
}

export function isBankLinked(bankDetails?: {
  accountNumber?: string;
  upiId?: string;
}) {
  return Boolean(bankDetails?.accountNumber || bankDetails?.upiId);
}

export function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber;
  return `${accountNumber.slice(0, 5)}${'x'.repeat(Math.max(accountNumber.length - 5, 5))}`;
}
