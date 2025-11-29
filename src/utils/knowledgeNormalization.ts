export type KnowledgeVisibility = 'public' | 'subscribers' | 'private';

const stringFromCandidate = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
};

export const resolveKnowledgeId = (entry: any): string => {
    const candidates = [
        entry?.id,
        entry?.kb_id,
        entry?.knowledge_id,
        entry?.knowledgeId,
        entry?.knowledge_base_id,
        entry?.file_id,
        entry?.fileId,
        entry?.document_id,
        entry?.uuid,
        entry?.metadata?.kb_id,
        entry?.metadata?.knowledge_id,
        entry?.metadata?.id,
    ];

    const directMatch = candidates
        .map(stringFromCandidate)
        .find((idValue) => typeof idValue === 'string' && idValue.length > 0);

    if (directMatch) {
        return directMatch;
    }

    if (entry && typeof entry === 'object') {
        for (const [key, value] of Object.entries(entry)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'professional_id') {
                continue;
            }
            if (lowerKey.endsWith('_id') || lowerKey.includes('uuid')) {
                const candidate = stringFromCandidate(value);
                if (candidate) {
                    return candidate;
                }
            }
        }
    }

    return '';
};

export const resolveKnowledgeTitle = (entry: any): string => {
    const candidates = [
        entry?.title,
        entry?.name,
        entry?.display_name,
        entry?.file_title,
        entry?.document_title,
        entry?.file_name,
        entry?.filename,
        entry?.original_file_name,
        entry?.metadata?.title,
        entry?.metadata?.file_name,
    ]
        .map(stringFromCandidate)
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

    if (candidates.length) {
        const unique = candidates.filter((value, index) => candidates.indexOf(value) === index);
        return unique[0];
    }

    return 'Untitled File';
};

export const resolveKnowledgeType = (entry: any): string => {
    const candidates = [
        entry?.file_type,
        entry?.metadata?.file_type,
        entry?.mime_type,
        entry?.content_type,
        entry?.metadata?.mime_type,
    ]
        .map(stringFromCandidate)
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

    return candidates.length ? candidates[0] : 'unknown';
};

const isoStringFromValue = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return new Date(value).toISOString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return undefined;
};

export const resolveKnowledgeCreatedAt = (entry: any): string => {
    const candidates = [
        entry?.created_at,
        entry?.createdAt,
        entry?.created_at_utc,
        entry?.created,
        entry?.created_on,
        entry?.metadata?.created_at,
        entry?.metadata?.created,
    ]
        .map(isoStringFromValue)
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

    if (candidates.length) {
        return candidates[0];
    }

    return new Date().toISOString();
};

const normalizeVisibilityString = (value: string): KnowledgeVisibility | undefined => {
    const lowered = value.trim().toLowerCase();

    if (['public', 'everyone', 'visible', 'open'].includes(lowered)) {
        return 'public';
    }
    if (['subscriber', 'subscribers', 'subscriber_only', 'subscribers_only', 'paid', 'members', 'restricted'].includes(lowered)) {
        return 'subscribers';
    }
    if (['private', 'hidden', 'only_me'].includes(lowered)) {
        return 'private';
    }

    return undefined;
};

export const resolveKnowledgeVisibility = (entry: any): KnowledgeVisibility => {
    const candidates = [
        entry?.visibility,
        entry?.visibility_mode,
        entry?.visibilityMode,
        entry?.visibility_status,
        entry?.visibilityStatus,
        entry?.access_level,
        entry?.accessLevel,
        entry?.access_type,
        entry?.accessType,
        entry?.metadata?.visibility,
        entry?.metadata?.visibility_mode,
        entry?.metadata?.access_level,
        entry?.metadata?.access_type,
    ]
        .map(stringFromCandidate)
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

    for (const candidate of candidates) {
        const normalized = normalizeVisibilityString(candidate);
        if (normalized) {
            return normalized;
        }
    }

    if (entry?.is_private) {
        return 'private';
    }
    if (entry?.is_subscriber_only || entry?.subscriber_only) {
        return 'subscribers';
    }
    if (entry?.is_public) {
        return 'public';
    }

    return 'public';
};

export interface NormalizedKnowledgeEntry {
    id: string;
    title: string;
    file_type: string;
    created_at: string;
    visibility: KnowledgeVisibility;
    [key: string]: any;
}

export const normalizeKnowledgeEntry = (entry: any): NormalizedKnowledgeEntry => {
    const id = resolveKnowledgeId(entry);
    const title = resolveKnowledgeTitle(entry);
    const fileType = resolveKnowledgeType(entry);
    const createdAt = resolveKnowledgeCreatedAt(entry);
    const visibility = resolveKnowledgeVisibility(entry);

    return {
        ...entry,
        id: id || entry?.id || '',
        title,
        file_type: fileType,
        created_at: createdAt,
        visibility,
    };
};
