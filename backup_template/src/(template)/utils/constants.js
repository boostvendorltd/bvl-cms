export const STATUS_MAP = {
    0: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
    1: { label: 'Active', color: 'bg-green-100 text-green-800' },
    2: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    3: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
};

export const CONTRACT_STATUS_MAP = {
    0: 'Agreement',
    1: 'Pending',
    2: 'Preparing',
    3: 'Cancellation',
};

export const PAYMENT_METHOD_MAP = {
    0: 'Bank Transfer',
    1: 'Cash',
    2: 'Online Payment',
};

export const COMMISSION_TYPE_MAP = {
    'percentage': 'Percentage',
    'fixed': 'Fixed Amount',
};
