import { Injectable } from '@nestjs/common';

export interface Coordinates {
  longitude: number;
  latitude: number;
}

@Injectable()
export class GeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.opencagedata.com/geocode/v1/json';

  constructor() {
    // You can use OpenCage, Google Maps, or other geocoding services
    this.apiKey = process.env.OPENCAGE_API_KEY || '';
  }

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!this.apiKey) {
      console.warn('No geocoding API key provided. Skipping geocoding.');
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseUrl}?q=${encodedAddress}&key=${this.apiKey}&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          longitude: result.geometry.lng,
          latitude: result.geometry.lat
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Geocoding failed for address: ${address}`, error);
      return null;
    }
  }

  // Alternative: Use Google Maps Geocoding API
  async geocodeWithGoogle(address: string): Promise<Coordinates | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('No Google Maps API key provided.');
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          longitude: location.lng,
          latitude: location.lat
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Google geocoding failed for address: ${address}`, error);
      return null;
    }
  }

  // Batch geocoding with rate limiting
  async batchGeocode(addresses: string[], delayMs: number = 100): Promise<Map<string, Coordinates | null>> {
    const results = new Map<string, Coordinates | null>();
    
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      console.log(`Geocoding ${i + 1}/${addresses.length}: ${address}`);
      
      const coordinates = await this.geocodeAddress(address);
      results.set(address, coordinates);
      
      // Rate limiting
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }
}
