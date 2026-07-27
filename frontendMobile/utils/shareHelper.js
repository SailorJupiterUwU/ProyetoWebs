import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**

 */
export const resolveImageToLocalUri = async (imageSource, filename) => {
    if (!imageSource) throw new Error('No hay imagen para compartir');

    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    if (imageSource.startsWith('data:image')) {
        const base64Data = imageSource.split(',')[1];
        await FileSystem.writeAsStringAsync(localUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return localUri;
    }

    // Es una URL remota, la descargamos
    const { uri } = await FileSystem.downloadAsync(imageSource, localUri);
    return uri;
};

/**
 * Igual que resolveImageToLocalUri, pero para base64 "crudo" sin el
 * prefijo data:image/png;base64,... — es el formato que devuelve
 * react-native-qrcode-svg en su método toDataURL().
 */
export const saveRawBase64ToFile = async (rawBase64, filename) => {
    const localUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(localUri, rawBase64, {
        encoding: FileSystem.EncodingType.Base64,
    });
    return localUri;
};

/**
 * Comparte una imagen ya resuelta a archivo local con el share sheet nativo
 * (WhatsApp, Telegram, Drive, Mensajes, etc. — lo que el usuario tenga instalado)
 */
export const shareImage = async (localUri, dialogTitle) => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Compartir no está disponible en este dispositivo');
    }
    await Sharing.shareAsync(localUri, {
        mimeType: 'image/png',
        dialogTitle,
    });
};

/**
 * Comparte directamente el código QR (base64 o URL) generado por el backend
 */
export const shareQrCode = async (codigoQr, filename = 'qr-pase.png') => {
    const localUri = await resolveImageToLocalUri(codigoQr, filename);
    await shareImage(localUri, 'Compartir código QR');
};