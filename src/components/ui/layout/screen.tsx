import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

type PaddingPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type StatusBarStyle = 'auto' | 'light' | 'dark';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  edges?: Edge[];
  padding?: PaddingPreset;
  header?: ReactNode;
  statusBarStyle?: StatusBarStyle;
  keyboardAware?: boolean;
  className?: string;
  scrollViewProps?: any;
};

const paddingStyles: Record<PaddingPreset, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export function Screen({
  children,
  scroll = true,
  safeArea = true,
  edges,
  padding = 'none',
  header,
  statusBarStyle = 'dark',
  keyboardAware = false,
  className,
  scrollViewProps,
}: ScreenProps) {
  const Container = safeArea ? SafeAreaView : View;
  const Content = scroll ? ScrollView : View;

  const content = (
    <>
      <StatusBar style={statusBarStyle} />

      {header}

      <Content
        {...(scroll && scrollViewProps)}
        className={twMerge('flex-1', paddingStyles[padding], className)}
        contentContainerClassName={scroll ? paddingStyles[padding] : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </>
  );

  if (keyboardAware) {
    return (
      <Container className="flex-1 bg-white" edges={edges}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {content}
        </KeyboardAvoidingView>
      </Container>
    );
  }

  return (
    <Container className="flex-1 bg-white" edges={edges}>
      {content}
    </Container>
  );
}
