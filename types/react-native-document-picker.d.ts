declare module 'react-native-document-picker' {
    export type DocumentPickerResponse = {
        uri?: string | null;
        fileCopyUri?: string | null;
        name?: string | null;
        size?: number | null;
        type?: string | null;
    };

    export type PickSingleOptions = {
        type?: unknown[];
        presentationStyle?:
        | 'fullScreen'
        | 'pageSheet'
        | 'formSheet'
        | 'currentContext'
        | 'overFullScreen'
        | 'overCurrentContext'
        | 'popover'
        | 'automatic';
        copyTo?: 'documentDirectory' | 'cachesDirectory';
    };

    type DocumentPickerModule = {
        pickSingle(options: PickSingleOptions): Promise<DocumentPickerResponse>;
        isCancel(error: unknown): boolean;
        types: {
            audio: unknown;
            images?: unknown;
            video?: unknown;
            pdf?: unknown;
            plainText?: unknown;
            doc?: unknown;
            docx?: unknown;
            xls?: unknown;
            xlsx?: unknown;
        };
    };

    const DocumentPicker: DocumentPickerModule;
    export const types: {
        audio: string;
        images?: string;
        video?: string;
        pdf?: string;
        plainText?: string;
        doc?: string;
        docx?: string;
        xls?: string;
        xlsx?: string;
    };
    export function isCancel(error: unknown): boolean;
    export default DocumentPicker;
}
