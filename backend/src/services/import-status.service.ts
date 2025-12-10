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
    private status: ImportStatus = {
        state: 'IDLE',
        progress: 0,
        total: 0,
        current: 0,
        message: ''
    };

    update(update: Partial<ImportStatus>) {
        this.status = { ...this.status, ...update };
    }

    start(total: number, message: string = 'Starting import...') {
        this.status = {
            state: 'PROCESSING',
            progress: 0,
            total,
            current: 0,
            message
        };
    }

    increment(message?: string) {
        if (this.status.state !== 'PROCESSING') return;

        this.status.current++;
        this.status.progress = this.status.total > 0
            ? Math.round((this.status.current / this.status.total) * 100)
            : 0;

        if (message) {
            this.status.message = message;
        }
    }

    complete(message: string = 'Import completed successfully') {
        this.status.state = 'COMPLETED';
        this.status.progress = 100;
        this.status.message = message;
    }

    error(error: string) {
        this.status.state = 'ERROR';
        this.status.error = error;
        this.status.message = `Error: ${error}`;
    }

    get() {
        return this.status;
    }

    reset() {
        this.status = {
            state: 'IDLE',
            progress: 0,
            total: 0,
            current: 0,
            message: ''
        };
    }
}

export default new ImportStatusService();
