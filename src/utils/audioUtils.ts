export function convertTo16BitPCM(buffer: ArrayBuffer): ArrayBuffer {
    const input = new Float32Array(buffer);
    const output = new DataView(new ArrayBuffer(input.length * 2));

    let offset = 0;
    for (let i = 0; i < input.length; i += 1, offset += 2) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        output.setInt16(offset, value, true);
    }

    return output.buffer;
}

export function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string {
    const uint8Buffer = new Uint8Array(arrayBuffer);
    let binary = '';

    for (let i = 0; i < uint8Buffer.byteLength; i += 1) {
        binary += String.fromCharCode(uint8Buffer[i]);
    }

    if (typeof global.btoa === 'function') {
        return global.btoa(binary);
    }

    throw new Error('base64ArrayBuffer requires global.btoa support');
}
