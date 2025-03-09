import { App } from 'vue';

import Inbox from './components/Inbox.vue';
import InboxContent from './components/InboxContent.vue';
import Notifications from './components/Notifications.vue';
import Preferences from './components/Preferences.vue';
import Bell from './components/Bell.vue';

export * from './components';
export * from './hooks';
export * from './utils/types';

// Optional: Global install function
export default {
  install(app: App) {
    app.component('Inbox', Inbox);
    app.component('InboxContent', InboxContent);
    app.component('Notifications', Notifications);
    app.component('Preferences', Preferences);
    app.component('Bell', Bell);
  },
};
