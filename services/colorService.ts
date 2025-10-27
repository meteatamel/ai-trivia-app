
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
};

const getAverageColor = (imageUrl: string): Promise<{ r: number, g: number, b: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            canvas.width = 1;
            canvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);

            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            resolve({ r, g, b });
        };
        img.onerror = (err) => reject(err);
    });
};

export const generateThemeFromImage = async (imageUrl: string): Promise<string> => {
    try {
        const { r, g, b } = await getAverageColor(imageUrl);
        const [h, s] = rgbToHsl(r, g, b);
        
        const bgLightness = 95;
        const bgSaturation = Math.min(s, 50);

        return `hsl(${h}, ${bgSaturation}%, ${bgLightness}%)`;
    } catch (error) {
        console.error("Failed to generate theme from image:", error);
        return '#f0f9ff'; // Default light color
    }
};
