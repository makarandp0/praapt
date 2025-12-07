export type StatusType = 'info' | 'error' | 'success';

export interface Status {
  message: string;
  type: StatusType;
}

interface StatusMessageProps {
  status: Status | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether to center the text (default: false) */
  centered?: boolean;
}

const TYPE_CLASSES: Record<StatusType, string> = {
  error: 'text-red-600',
  success: 'text-green-600',
  info: 'text-gray-600',
};

/**
 * Displays a status message with appropriate styling based on type.
 * - error: red text
 * - success: green text
 * - info: gray text
 */
export function StatusMessage({
  status,
  className = '',
  centered = false,
}: StatusMessageProps): JSX.Element | null {
  if (!status) {
    return null;
  }

  const colorClass = TYPE_CLASSES[status.type];
  const centerClass = centered ? 'text-center' : '';

  return (
    <p className={`text-sm ${colorClass} ${centerClass} ${className}`.trim()}>{status.message}</p>
  );
}
