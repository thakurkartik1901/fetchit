/* eslint-disable max-lines-per-function */
import { useState } from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/lib/haptics';

import { Button } from '../core/button';
import { Input } from '../core/input';
import { Text } from '../core/text';

type AlertDialogVariant =
  | 'error'
  | 'success'
  | 'warning'
  | 'confirm'
  | 'prompt';

type AlertDialogProps = {
  isVisible: boolean;
  variant?: AlertDialogVariant;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  placeholder?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  onClose: () => void;
};

export function AlertDialog({
  isVisible,
  variant = 'confirm',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
  placeholder,
  onConfirm,
  onCancel,
  onClose,
}: AlertDialogProps) {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (variant === 'prompt') {
      onConfirm?.(inputValue);
    } else {
      onConfirm?.();
    }
    haptics.light();
    onClose();
    setInputValue('');
  };

  const handleCancel = () => {
    onCancel?.();
    haptics.light();
    onClose();
    setInputValue('');
  };

  const showCancel = variant === 'confirm' || variant === 'prompt';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View
          className="w-full max-w-sm rounded-3xl bg-white p-6"
          style={{ marginBottom: insets.bottom }}
        >
          <Text className="mb-3 text-center text-lg">{title}</Text>

          {message && (
            <Text className="text-text-subtitle mb-6 text-center text-base">
              {message}
            </Text>
          )}

          {variant === 'prompt' && (
            <Input
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={placeholder}
              className="mb-6"
              autoFocus
            />
          )}

          <View className="gap-3">
            <Button
              variant={destructive ? 'destructive' : 'default'}
              fullWidth
              onPress={handleConfirm}
            >
              {confirmText}
            </Button>

            {showCancel && (
              <Button variant="outline" fullWidth onPress={handleCancel}>
                {cancelText}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
