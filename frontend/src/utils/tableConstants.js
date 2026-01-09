export const LOCATIONS = [
    'Main Hall',
    'VIP Section',
    'Outdoor Terrace',
    'Bar Area',
    'Private Room',
    'Garden',
];

export const STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: 'Available', color: 'green' },
    { value: 'OCCUPIED', label: 'Occupied', color: 'yellow' },
    { value: 'RESERVED', label: 'Reserved', color: 'blue' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'red' },
];

export const SORT_OPTIONS = [
    { value: 'tableNumber', label: 'Table Number' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'createdAt', label: 'Creation Date' },
];

export const validateTableData = (data) => {
    const errors = {};

    if (!data.tableNumber || String(data.tableNumber).trim() === '') {
        errors.tableNumber = 'Table number is required';
    }

    if (!data.capacity) {
        errors.capacity = 'Capacity is required';
    } else if (data.capacity < 1 || data.capacity > 20) {
        errors.capacity = 'Capacity must be between 1 and 20';
    }

    return errors;
};