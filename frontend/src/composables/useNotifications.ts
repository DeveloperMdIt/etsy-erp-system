import { ref } from 'vue';

interface Notification {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

const notifications = ref<Notification[]>([]);
let nextId = 1;

export function useNotifications() {
    const showNotification = (type: Notification['type'], message: string) => {
        const id = nextId++;
        notifications.value.push({ id, type, message });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const index = notifications.value.findIndex(n => n.id === id);
            if (index > -1) {
                notifications.value.splice(index, 1);
            }
        }, 5000);
    };

    const showSuccess = (message: string) => showNotification('success', message);
    const showError = (message: string) => showNotification('error', message);
    const showInfo = (message: string) => showNotification('info', message);
    const showWarning = (message: string) => showNotification('warning', message);

    const removeNotification = (id: number) => {
        const index = notifications.value.findIndex(n => n.id === id);
        if (index > -1) {
            notifications.value.splice(index, 1);
        }
    };

    return {
        notifications,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeNotification
    };
}
