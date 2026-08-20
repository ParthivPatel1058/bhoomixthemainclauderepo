import { MapPin, Phone, Clock, Navigation, Store } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import NavigationBar from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/PageHeader';

interface Shop {
  id: number;
  name: string;
  nameHi: string;
  type: string;
  typeHi: string;
  address: string;
  addressHi: string;
  phone: string;
  hours: string;
  hoursHi: string;
  distance: string;
  rating: number;
  products: string[];
  productsHi: string[];
}

const shops: Shop[] = [
  {
    id: 1,
    name: "Krishna Agro Centre",
    nameHi: "कृष्णा एग्रो सेंटर",
    type: "Seeds & Fertilizers",
    typeHi: "बीज और उर्वरक",
    address: "123 Main Road, Sector 15, Punjab",
    addressHi: "123 मुख्य सड़क, सेक्टर 15, पंजाब",
    phone: "+91-9876543210",
    hours: "8:00 AM - 8:00 PM",
    hoursHi: "सुबह 8:00 - रात 8:00",
    distance: "2.5 km",
    rating: 4.5,
    products: ["Seeds", "Fertilizers", "Pesticides"],
    productsHi: ["बीज", "उर्वरक", "कीटनाशक"]
  },
  {
    id: 2,
    name: "Bharat Farm Equipment",
    nameHi: "भारत फार्म उपकरण",
    type: "Tools & Equipment",
    typeHi: "उपकरण और मशीनें",
    address: "456 Industrial Area, Near Railway Station",
    addressHi: "456 औद्योगिक क्षेत्र, रेलवे स्टेशन के पास",
    phone: "+91-9876543211",
    hours: "9:00 AM - 7:00 PM",
    hoursHi: "सुबह 9:00 - शाम 7:00",
    distance: "3.8 km",
    rating: 4.7,
    products: ["Tractors", "Sprayers", "Tools"],
    productsHi: ["ट्रैक्टर", "स्प्रेयर", "उपकरण"]
  },
  {
    id: 3,
    name: "Green Valley Seeds",
    nameHi: "ग्रीन वैली बीज",
    type: "Specialized Seeds",
    typeHi: "विशेष बीज",
    address: "789 Green Park, Opposite Market",
    addressHi: "789 ग्रीन पार्क, बाजार के सामने",
    phone: "+91-9876543212",
    hours: "7:00 AM - 9:00 PM",
    hoursHi: "सुबह 7:00 - रात 9:00",
    distance: "1.2 km",
    rating: 4.8,
    products: ["Hybrid Seeds", "Organic Seeds", "Vegetables"],
    productsHi: ["हाइब्रिड बीज", "जैविक बीज", "सब्जियां"]
  },
  {
    id: 4,
    name: "Fertilizer Hub",
    nameHi: "उर्वरक हब",
    type: "Fertilizers & Nutrients",
    typeHi: "उर्वरक और पोषक तत्व",
    address: "321 Kisan Nagar, Main Chowk",
    addressHi: "321 किसान नगर, मेन चौक",
    phone: "+91-9876543213",
    hours: "8:30 AM - 7:30 PM",
    hoursHi: "सुबह 8:30 - शाम 7:30",
    distance: "4.5 km",
    rating: 4.6,
    products: ["Urea", "DAP", "NPK", "Organic"],
    productsHi: ["यूरिया", "DAP", "NPK", "जैविक"]
  },
  {
    id: 5,
    name: "Modern Agri Solutions",
    nameHi: "मॉडर्न एग्री सॉल्यूशंस",
    type: "Complete Agri Store",
    typeHi: "संपूर्ण कृषि स्टोर",
    address: "567 Highway Road, Near Bus Stand",
    addressHi: "567 हाईवे रोड, बस स्टैंड के पास",
    phone: "+91-9876543214",
    hours: "7:30 AM - 8:30 PM",
    hoursHi: "सुबह 7:30 - रात 8:30",
    distance: "5.2 km",
    rating: 4.9,
    products: ["Seeds", "Fertilizers", "Tools", "Pesticides"],
    productsHi: ["बीज", "उर्वरक", "उपकरण", "कीटनाशक"]
  }
];

const ShopLocator = () => {
  const { language, tx } = useLanguage();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleGetDirections = (shop: Shop) => {
    if (userLocation) {
      // Open Google Maps with directions
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.address)}`,
        '_blank'
      );
    } else {
      toast({
        title: tx('Enable Location', 'स्थान सक्षम करें'),
        description: tx('Please enable location to get directions', 'दिशा-निर्देश प्राप्त करने के लिए स्थान सक्षम करें'),
        variant: 'destructive'
      });
    }
  };

  const handleFindNearby = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          toast({
            title: tx('Location Detected', 'स्थान का पता चला'),
            description: tx('Showing nearby shops', 'आस-पास की दुकानें दिखाई जा रही हैं')
          });
        },
        () => {
          toast({
            title: tx('Location Error', 'स्थान त्रुटि'),
            description: tx('Could not detect your location', 'आपका स्थान नहीं मिल सका'),
            variant: 'destructive'
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen">
      <NavigationBar />
      
      <div className="pt-8 pb-16 px-4">
        <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <PageHeader
        eyebrow={tx('Nearby', 'आस-पास')}
        title={tx('Find Nearby Shops', 'आस-पास की दुकानें खोजें')}
        lede={tx('Agricultural shops near you for seeds, fertilizers, and farming tools', 'बीज, उर्वरक और कृषि उपकरणों के लिए आपके पास की कृषि दुकानें')}
      />
            
            <Button 
              onClick={handleFindNearby}
              className="btn-metal border-0 hover:shadow-lg"
              size="lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              {tx('Find Shops Near Me', 'मेरे पास दुकानें खोजें')}
            </Button>
          </div>

          {/* Shops Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {shops.map((shop, index) => (
              <Card 
                key={shop.id} 
                className="glass hover:shadow-2xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl gradient-primary">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {tx(shop.name, shop.nameHi)}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {tx(shop.type, shop.typeHi)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{shop.rating}</span>
                      </div>
                      <Badge className="mt-1 gradient-secondary text-white border-0">
                        {shop.distance}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {tx(shop.address, shop.addressHi)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <a
                        href={`tel:${shop.phone}`}
                        className="inline-flex min-h-11 items-center py-2 text-primary hover:underline"
                      >
                        {shop.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {tx(shop.hours, shop.hoursHi)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2 text-primary">
                      {tx('Available Products:', 'उपलब्ध उत्पाद:')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {shop.products.map((product, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tx(product, shop.productsHi[i] ?? product)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`tel:${shop.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {tx('Call', 'कॉल करें')}
                    </Button>
                    <Button 
                      className="btn-metal border-0"
                      onClick={() => handleGetDirections(shop)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      {tx('Directions', 'दिशा-निर्देश')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopLocator;