// import { View } from 'react-native';

// import { cn } from '@/lib/cn';
// import { Colors } from '@/theme/tokens';

// import { Button } from './Button';
// import { Icon, type IconName } from './Icon';
// import { Heading3Text, SubtitleText } from './Text';

// type EmptyStateProps = {
//   icon?: IconName;
//   title: string;
//   description?: string;
//   actionLabel?: string;
//   onAction?: () => void;
//   className?: string;
// };

// export function EmptyState({
//   icon,
//   title,
//   description,
//   actionLabel,
//   onAction,
//   className,
// }: EmptyStateProps) {
//   return (
//     <View className={cn('flex-1 items-center justify-center p-8', className)}>
//       {icon && (
//         <View className="mb-4">
//           <Icon name={icon} size={64} color={Colors.panther.disabled} />
//         </View>
//       )}

//       <Heading3Text className="mb-2 text-center">{title}</Heading3Text>

//       {description && (
//         <SubtitleText className="text-text-subtitle mb-6 text-center">
//           {description}
//         </SubtitleText>
//       )}

//       {actionLabel && onAction && (
//         <Button variant="outline" onPress={onAction}>
//           {actionLabel}
//         </Button>
//       )}
//     </View>
//   );
// }
