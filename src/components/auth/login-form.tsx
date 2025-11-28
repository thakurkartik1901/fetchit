/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Pressable, ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  ControlledInput,
  HeroSection,
  Text,
  View,
} from '@/components/ui';
import { Apple, Facebook, Google, Package } from '@/components/ui/icons';
import colors from '@/components/ui/tokens/colors';

const schema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image Section */}
        <View className="h-96">
          <HeroSection
            icon={<Package color="#FFFFFF" width={64} height={64} />}
          />
        </View>

        {/* Form Section */}
        <View className="flex-1 bg-white px-6 pt-8">
          {/* Welcome Title */}
          <Text
            testID="form-title"
            className="mb-6 font-inter-bold text-2xl text-black"
          >
            Welcome!
          </Text>

          {/* Email Input */}
          <ControlledInput
            testID="email-input"
            control={control}
            name="email"
            label=""
            placeholder="Email Address"
            className="mb-2 rounded-xl border border-neutral-300 px-2"
          />

          {/* Password Input */}
          <ControlledInput
            testID="password-input"
            control={control}
            name="password"
            label=""
            placeholder="Password"
            secureTextEntry={true}
            className="mb-2 rounded-xl border border-neutral-300 px-2"
          />

          {/* Forgot Password Link */}
          <Link href="/" asChild>
            <Pressable className="mb-6">
              <Text className="font-inter-medium text-sm text-primary-600">
                Forgot password?
              </Text>
            </Pressable>
          </Link>

          {/* Login Button */}
          <Button
            testID="login-button"
            label="Login"
            variant="secondary"
            onPress={handleSubmit(onSubmit)}
            className="mb-4"
          />

          {/* Sign Up Link */}
          <View className="mb-6 flex-row items-center justify-center">
            <Text className="text-sm text-neutral-600">Not a member? </Text>
            <Link href="/" asChild>
              <Pressable>
                <Text className="font-inter-medium text-sm text-primary-600">
                  Register now
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Divider */}
          <View className="mb-6 flex-row items-center">
            <View className="h-px flex-1 bg-neutral-300" />
            <Text className="px-4 text-sm text-neutral-500">
              Or continue with
            </Text>
            <View className="h-px flex-1 bg-neutral-300" />
          </View>

          {/* Social Login Buttons */}
          <View className="mb-8 flex-row items-center justify-center gap-4">
            <Pressable
              className="size-12 items-center justify-center rounded-full bg-neutral-300"
              accessibilityLabel="Continue with Google"
            >
              <Google width={28} height={28} />
            </Pressable>

            <Pressable
              className="size-12 items-center justify-center rounded-full bg-neutral-300"
              accessibilityLabel="Continue with Apple"
            >
              <Apple width={28} height={28} color={colors.white} />
            </Pressable>

            <Pressable
              className="size-12 items-center justify-center rounded-full bg-neutral-300"
              accessibilityLabel="Continue with Facebook"
            >
              <Facebook width={28} height={28} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
