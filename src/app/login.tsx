import { useRouter } from 'expo-router';
import React from 'react';

import type { LoginFormProps } from '@/components/auth/login-form';
import { LoginForm } from '@/components/auth/login-form';
import { Screen } from '@/components/ui/layout';
import { useAuth } from '@/store/auth';

export default function Login() {
  const router = useRouter();
  const signIn = useAuth.use.signIn();

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    console.log(data);
    signIn({ access: 'access-token', refresh: 'refresh-token' });
    router.push('/');
  };

  return (
    <Screen keyboardAware safeArea={false}>
      <LoginForm onSubmit={onSubmit} />
    </Screen>
  );
}
