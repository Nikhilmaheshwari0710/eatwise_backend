import { AffiliatePlatformId } from '../../../common/constants';

export interface AffiliatePlatformDefinition {
  platformId: AffiliatePlatformId;
  name: string;
  logoUrl: string;
  linkPrefix: string;
  commissionRate: string;
  isAvailable: boolean;
}

export const AFFILIATE_PLATFORMS: AffiliatePlatformDefinition[] = [
  {
    platformId: AffiliatePlatformId.AMAZON,
    name: 'Amazon',
    logoUrl: 'https://cdn.eatwise.app/platforms/amazon.png',
    linkPrefix: 'https://amzn.to/3RYZbsc?tag=',
    commissionRate: '3-10%',
    isAvailable: true,
  },
  {
    platformId: AffiliatePlatformId.FLIPKART,
    name: 'Flipkart',
    logoUrl: 'https://cdn.eatwise.app/platforms/flipkart.png',
    linkPrefix: 'https://fkrt.it/9xYzPq?affid=',
    commissionRate: '2-8%',
    isAvailable: true,
  },
  {
    platformId: AffiliatePlatformId.BIGBASKET,
    name: 'BigBasket',
    logoUrl: 'https://cdn.eatwise.app/platforms/bigbasket.png',
    linkPrefix: 'https://bb.club/7kLmN?ref=',
    commissionRate: '2-5%',
    isAvailable: true,
  },
  {
    platformId: AffiliatePlatformId.ONE_MG,
    name: 'Tata 1mg',
    logoUrl: 'https://cdn.eatwise.app/platforms/1mg.png',
    linkPrefix: 'https://1mg.page.link/8jKq?aff=',
    commissionRate: '4-12%',
    isAvailable: true,
  },
];

export function getAffiliatePlatform(platformId: AffiliatePlatformId) {
  return AFFILIATE_PLATFORMS.find((platform) => platform.platformId === platformId);
}

export const TRANSACTION_STATUS_META = {
  paid: { label: 'Paid', color: '#10B981' },
  pending: { label: 'Pending', color: '#F59E0B' },
  rejected: { label: 'Rejected', color: '#EF4444' },
} as const;
