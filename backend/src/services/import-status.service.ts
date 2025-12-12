export type ImportState = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

interface ImportStatus {
    state: ImportState;
    progress: number;
    total: number;
    current: number;
    message: string;
    error?: string;
}

class ImportStatusService {
    private statuses: Map<string, ImportStatus> = new Map();

    private getInitialStatus(): ImportStatus {
        return {
            state: 'IDLE',
            progress: 0,
            total: 0,
            current: 0,
            message: ''
        };
    }

    update(tenantId: string, update: Partial<ImportStatus>) {
        const current = this.statuses.get(tenantId) || this.getInitialStatus();
        this.statuses.set(tenantId, { ...current, ...update });
    }

    start(tenantId: string, total: number, message: string = 'Starting import...') {
        this.statuses.set(tenantId, {
            state: 'PROCESSING',
            progress: 0,
            total,
            current: 0,
            message
        });
    }

    increment(tenantId: string, message?: string) {
        const status = this.statuses.get(tenantId);
        if (!status || status.state !== 'PROCESSING') return;

        status.current++;
        status.progress = status.total > 0
            ? Math.round((status.current / status.total) * 100)
            : 0;

        if (message) {
            status.message = message;
        }
        this.statuses.set(tenantId, status);
    }

    complete(tenantId: string, message: string = 'Import completed successfully') {
        const status = this.statuses.get(tenantId) || this.getInitialStatus();
        status.state = 'COMPLETED';
        status.progress = 100;
        status.message = message;
        this.statuses.set(tenantId, status);
    }

    error(tenantId: string, error: string) {
        const status = this.statuses.get(tenantId) || this.getInitialStatus();
        status.state = 'ERROR';
        status.error = error;
        status.message = `Error: ${error}`;
        this.statuses.set(tenantId, status);
    }

    get(tenantId: string): ImportStatus {
        return this.statuses.get(tenantId) || this.getInitialStatus();
    }

    reset(tenantId: string) {
        this.statuses.set(tenantId, this.getInitialStatus());
    }
}

export default new ImportStatusService();
