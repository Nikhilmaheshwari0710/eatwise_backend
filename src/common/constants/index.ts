export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  PHONE = 'PHONE',
}

export enum UserRole {
  PARENT = 'PARENT',
  CAREGIVER = 'CAREGIVER',
  COMMUNITY = 'COMMUNITY',
}

export enum OtpType {
  PHONE_LOGIN = 'PHONE_LOGIN',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  PASSWORD_RESET_PHONE = 'PASSWORD_RESET_PHONE',
  PASSWORD_RESET_EMAIL = 'PASSWORD_RESET_EMAIL',
  PASSWORD_RESET_SESSION = 'PASSWORD_RESET_SESSION',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  ACCOUNT_DELETE = 'ACCOUNT_DELETE',
  ACCOUNT_DELETE_TOKEN = 'ACCOUNT_DELETE_TOKEN',
}

export enum DeleteAccountReason {
  NOT_USEFUL = 'not_useful',
  PRIVACY_CONCERNS = 'privacy_concerns',
  SWITCHING_APP = 'switching_app',
  TOO_MANY_NOTIFICATIONS = 'too_many_notifications',
  ACCOUNT_ISSUES = 'account_issues',
  OTHER = 'other',
}

export enum DeleteRequestStatus {
  PENDING_OTP = 'PENDING_OTP',
  OTP_VERIFIED = 'OTP_VERIFIED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum PreferredLanguage {
  ENGLISH_INDIA = 'English (India)',
  HINDI = 'Hindi (हिन्दी)',
  MARATHI = 'Marathi (मराठी)',
  GUJARATI = 'Gujarati',
}

export enum DietPreference {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  NON_VEGETARIAN = 'Non-Vegetarian',
  EGGITARIAN = 'Eggitarian',
  JAIN = 'Jain',
}

export enum AvatarPresetId {
  RITIKA = 'ritika',
  ARJUN = 'arjun',
  CHILD1 = 'child1',
  CHILD2 = 'child2',
}

export enum ChildAvatarPresetId {
  CHILD1 = 'child1',
  CHILD2 = 'child2',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
}

export enum WeightUnit {
  KG = 'kg',
  LBS = 'lbs',
}

export enum HeightUnit {
  CM = 'cm',
  INCHES = 'inches',
}

export enum BmiCategory {
  UNDERWEIGHT = 'Underweight',
  NORMAL = 'Normal',
  OVERWEIGHT = 'Overweight',
}

export enum NotificationType {
  HEALTH_ALERT = 'health_alert',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  GROWTH_MILESTONE = 'growth_milestone',
  AI_TIP = 'ai_tip',
  PRODUCT_RECALL = 'product_recall',
  SYSTEM = 'system',
}

export enum NotificationFilter {
  ALL = 'all',
  UNREAD = 'unread',
  HEALTH = 'health',
  ACTIVITY = 'activity',
  SYSTEM = 'system',
}

export enum PushPlatform {
  ANDROID = 'android',
  IOS = 'ios',
}

export enum HealthLabel {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  MODERATE = 'Moderate',
  HIGH_RISK = 'High Risk',
}

export enum HighlightType {
  DANGER = 'danger',
  WARNING = 'warning',
  SUCCESS = 'success',
  INFO = 'info',
}

export enum ScanHistoryFilter {
  ALL = 'all',
  HEALTHY = 'healthy',
  MODERATE = 'moderate',
  RISK = 'risk',
}

export enum CommunityTab {
  FOR_YOU = 'for_you',
  NUTRITION = 'nutrition',
  RECIPES = 'recipes',
  TIPS = 'tips',
}

export enum PostCategory {
  NUTRITION = 'Nutrition',
  RECIPE = 'Recipe',
  TIPS = 'Tips',
  PARENTING = 'Parenting',
  GENERAL = 'General',
}

export enum AffiliatePlatformId {
  AMAZON = 'Amazon',
  FLIPKART = 'Flipkart',
  BIGBASKET = 'BigBasket',
  ONE_MG = '1mg',
}

export enum AffiliateTransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REJECTED = 'rejected',
}

export enum AffiliateClickSource {
  WHATSAPP = 'whatsapp',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  OTHER = 'other',
}

export enum AffiliateDeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}
