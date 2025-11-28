import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAddPost, usePosts } from '@/api';
import { Button, ControlledInput, View } from '@/components/ui';
import { toast } from '@/lib/toast';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

type FormType = z.infer<typeof schema>;

export default function AddPost() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();
  const queryClient = useQueryClient();
  const router = useRouter();

  const onSubmit = (data: FormType) => {
    addPost(
      { ...data, userId: 1 },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: usePosts.getKey() });
          toast.success('Post added successfully');
          router.back();
        },
        onError: (error) => {
          toast.fromHttpError(error);
        },
      }
    );
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Post',
          headerBackTitle: 'Feed',
        }}
      />
      <View className="flex-1 p-4 ">
        <ControlledInput
          name="title"
          label="Title"
          control={control}
          testID="title"
        />
        <ControlledInput
          name="body"
          label="Content"
          control={control}
          multiline
          testID="body-input"
        />
        <Button
          label="Add Post"
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          testID="add-post-button"
        />
      </View>
    </>
  );
}
