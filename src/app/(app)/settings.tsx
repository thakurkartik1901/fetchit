import { Env } from '@env';

import { Item } from '@/components/settings/item';
import { LanguageItem } from '@/components/settings/language-item';
import { ProfileSection } from '@/components/settings/profile-section';
import { ThemeItem } from '@/components/settings/theme-item';
import { Screen, View } from '@/components/ui';
import { useAuth } from '@/store/auth';

function Divider() {
  return <View className="ml-4 h-px bg-neutral-200 dark:bg-charcoal-700" />;
}

export default function Settings() {
  const signOut = useAuth.use.signOut();

  return (
    <Screen className="bg-white dark:bg-charcoal-900" scroll={true}>
      {/* Profile Section */}
      <ProfileSection name="Lucas Scott" username="lucasscott3" />

      {/* Menu Items */}
      <View className="px-4">
        {/* General Settings */}
        <View className="mb-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-charcoal-700">
          <LanguageItem />
          <Divider />
          <ThemeItem />
        </View>

        {/* About */}
        <View className="mb-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-charcoal-700">
          <Item text="settings.app_name" value={Env.NAME} />
          <Divider />
          <Item text="settings.version" value={Env.VERSION} />
        </View>

        {/* Links */}
        <View className="mb-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-charcoal-700">
          <Item text="settings.privacy" onPress={() => {}} />
          <Divider />
          <Item text="settings.terms" onPress={() => {}} />
        </View>

        {/* Logout */}
        <View className="mb-8 overflow-hidden rounded-xl border border-neutral-200 dark:border-charcoal-700">
          <Item text="settings.logout" onPress={signOut} />
        </View>
      </View>
    </Screen>
  );
}
