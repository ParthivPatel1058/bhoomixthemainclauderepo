import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, Cog, Wrench, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
const RoboticFarming = () => {
  const {
    t, language, tx } = useLanguage();
  
  const robotsByState = [{
    state: 'Punjab',
    robots: [{
      name: 'Happy Seeder',
      function: 'Paddy straw management & wheat sowing',
      price: '₹1,20,000 - ₹1,50,000',
      contact: 'Punjab Agricultural University - 0161-2401960',
      subsidy: '50% under SMAM'
    }, {
      name: 'Laser Land Leveler',
      function: 'Precision land leveling',
      price: '₹2,50,000 - ₹3,00,000',
      contact: 'Ludhiana Agri Machinery - 98765-43210',
      subsidy: '40% subsidy available'
    }, {
      name: 'Combine Harvester (Self-propelled)',
      function: 'Harvesting wheat, paddy',
      price: '₹25,00,000 - ₹40,00,000',
      contact: 'Preet Tractors, Patiala - 0175-2218000',
      subsidy: 'Custom hiring centers available'
    }]
  }, {
    state: 'Haryana',
    robots: [{
      name: 'Pneumatic Planter',
      function: 'Precision seeding for maize, cotton',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Karnal Agri Works - 0184-2200500',
      subsidy: '50% under SMAM'
    }, {
      name: 'Rotavator',
      function: 'Soil preparation & stubble management',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Sonalika Implements, Rohtak - 01262-255255',
      subsidy: '40% subsidy'
    }, {
      name: 'Multi-crop Thresher',
      function: 'Threshing wheat, paddy, pulses',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Gurgaon Machinery Hub - 0124-4567890',
      subsidy: 'Available for SHGs'
    }]
  }, {
    state: 'Uttar Pradesh',
    robots: [{
      name: 'Sugarcane Planter',
      function: 'Automated sugarcane planting',
      price: '₹3,50,000 - ₹5,00,000',
      contact: 'Lucknow Agri Solutions - 0522-2234567',
      subsidy: '40% subsidy under SMAM'
    }, {
      name: 'Reaper Binder',
      function: 'Harvesting & binding wheat, paddy',
      price: '₹1,80,000 - ₹2,50,000',
      contact: 'Meerut Farm Equipment - 0121-2765432',
      subsidy: '50% for SC/ST farmers'
    }, {
      name: 'Power Tiller',
      function: 'Small farm mechanization',
      price: '₹80,000 - ₹1,20,000',
      contact: 'VST Tillers, Noida - 0120-2345678',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Maharashtra',
    robots: [{
      name: 'Cotton Picker',
      function: 'Automated cotton harvesting',
      price: '₹8,00,000 - ₹12,00,000',
      contact: 'Nagpur Cotton Tech - 0712-2234567',
      subsidy: 'CHC subsidy available'
    }, {
      name: 'Drip Irrigation System',
      function: 'Precision water management',
      price: '₹50,000 - ₹1,50,000',
      contact: 'Jain Irrigation, Pune - 020-27420100',
      subsidy: '60% under PMKSY'
    }, {
      name: 'Grape Harvester',
      function: 'Mechanized grape picking',
      price: '₹6,00,000 - ₹8,00,000',
      contact: 'Nashik Agri Innovations - 0253-2234567',
      subsidy: 'Horticulture subsidy 40%'
    }]
  }, {
    state: 'Karnataka',
    robots: [{
      name: 'Arecanut Climber',
      function: 'Automated arecanut harvesting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Mangalore Agri Tech - 0824-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Coffee Pulper',
      function: 'Coffee bean processing',
      price: '₹2,00,000 - ₹3,50,000',
      contact: 'Coorg Coffee Equipment - 08272-228844',
      subsidy: '40% under PMFME'
    }, {
      name: 'Paddy Transplanter',
      function: 'Automated rice transplanting',
      price: '₹1,50,000 - ₹2,50,000',
      contact: 'Bengaluru Farm Solutions - 080-22345678',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Tamil Nadu',
    robots: [{
      name: 'Coconut De-husker',
      function: 'Automated coconut processing',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Coimbatore Agri Machines - 0422-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Banana Fiber Extractor',
      function: 'Fiber extraction from banana stem',
      price: '₹3,00,000 - ₹4,50,000',
      contact: 'Chennai Green Tech - 044-22345678',
      subsidy: '50% PMFME subsidy'
    }, {
      name: 'Drum Seeder',
      function: 'Direct seeding in paddy fields',
      price: '₹4,000 - ₹8,000',
      contact: 'Madurai Farm Tools - 0452-2345678',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Gujarat',
    robots: [{
      name: 'Groundnut Digger',
      function: 'Mechanized groundnut harvesting',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Rajkot Agri Equipment - 0281-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Cotton Stalk Puller',
      function: 'Removing cotton stalks',
      price: '₹1,20,000 - ₹1,80,000',
      contact: 'Ahmedabad Farm Tech - 079-22345678',
      subsidy: '40% subsidy'
    }, {
      name: 'Potato Planter',
      function: 'Automated potato planting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Surat Agri Innovations - 0261-2234567',
      subsidy: '50% under SMAM'
    }]
  }, {
    state: 'West Bengal',
    robots: [{
      name: 'Jute Ribbon Maker',
      function: 'Jute processing machinery',
      price: '₹2,50,000 - ₹3,50,000',
      contact: 'Kolkata Jute Tech - 033-22345678',
      subsidy: '40% subsidy'
    }, {
      name: 'Mini Combine Harvester',
      function: 'Small farm harvesting',
      price: '₹8,00,000 - ₹12,00,000',
      contact: 'Burdwan Agri Works - 0342-2234567',
      subsidy: 'CHC subsidy available'
    }, {
      name: 'Zero Till Drill',
      function: 'Conservation agriculture',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Siliguri Farm Solutions - 0353-2234567',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Rajasthan',
    robots: [{
      name: 'Mustard Harvester',
      function: 'Mechanized mustard cutting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Jaipur Agri Equipment - 0141-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Solar Water Pump',
      function: 'Solar-powered irrigation',
      price: '₹1,50,000 - ₹3,00,000',
      contact: 'Jodhpur Solar Solutions - 0291-2234567',
      subsidy: '60% under PMKUSUM'
    }, {
      name: 'Bajra Thresher',
      function: 'Pearl millet threshing',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Udaipur Farm Tech - 0294-2234567',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Madhya Pradesh',
    robots: [{
      name: 'Soybean Harvester',
      function: 'Automated soybean harvesting',
      price: '₹15,00,000 - ₹20,00,000',
      contact: 'Indore Agri Machines - 0731-2234567',
      subsidy: 'CHC support available'
    }, {
      name: 'Wheat Straw Baler',
      function: 'Straw baling for fodder',
      price: '₹2,50,000 - ₹4,00,000',
      contact: 'Bhopal Farm Equipment - 0755-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Garlic Planter',
      function: 'Mechanized garlic planting',
      price: '₹1,00,000 - ₹1,50,000',
      contact: 'Jabalpur Agri Solutions - 0761-2234567',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Andhra Pradesh',
    robots: [{
      name: 'Chili Harvester',
      function: 'Automated chili picking',
      price: '₹5,00,000 - ₹7,00,000',
      contact: 'Guntur Spice Tech - 0863-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Turmeric Polisher',
      function: 'Turmeric processing',
      price: '₹1,50,000 - ₹2,50,000',
      contact: 'Vijayawada Agri Process - 0866-2234567',
      subsidy: '40% PMFME subsidy'
    }, {
      name: 'Aqua Pond Aerator',
      function: 'Fish pond aeration',
      price: '₹50,000 - ₹1,00,000',
      contact: 'Visakhapatnam Aqua Tech - 0891-2234567',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Telangana',
    robots: [{
      name: 'Maize Sheller',
      function: 'Automated corn shelling',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Hyderabad Agri Equipment - 040-22345678',
      subsidy: '50% subsidy'
    }, {
      name: 'Turmeric Boiler',
      function: 'Turmeric curing equipment',
      price: '₹2,00,000 - ₹3,00,000',
      contact: 'Warangal Spice Machinery - 0870-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Cotton Seed Delinter',
      function: 'Cotton seed processing',
      price: '₹3,50,000 - ₹5,00,000',
      contact: 'Karimnagar Cotton Tech - 0878-2234567',
      subsidy: '40% subsidy'
    }]
  }];
  const robots = [{
    name: 'Autonomous Tractor',
    function: 'GPS-guided field operations',
    price: '₹25-45 Lakhs',
    category: 'General Purpose'
  }, {
    name: 'Crop Monitoring Drone',
    function: 'AI-powered crop health monitoring',
    price: '₹1.5-5 Lakhs',
    category: 'Monitoring'
  }, {
    name: 'Precision Seeding Robot',
    function: 'Automated precise seed placement',
    price: '₹8-15 Lakhs',
    category: 'Seeding'
  }, {
    name: 'Automated Spraying System',
    function: 'Smart targeted pesticide application',
    price: '₹12-20 Lakhs',
    category: 'Pest Control'
  }, {
    name: 'Harvesting Robot',
    function: 'AI vision-based selective harvesting',
    price: '₹18-35 Lakhs',
    category: 'Harvesting'
  }, {
    name: 'Weeding Robot',
    function: 'Mechanical chemical-free weeding',
    price: '₹6-12 Lakhs',
    category: 'Weed Management'
  }];
  return <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      <div className="pt-8 pb-12 px-4 container mx-auto">
        <div className="mb-12">
          <PageHeader
        eyebrow={tx('Technology', 'तकनीक')}
        title={tx('Agricultural Robotics', 'कृषि रोबोटिक्स')}
      />
        </div>


        {/* General Information */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {robots.map((robot, idx) => <div key={idx} className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{robot.name}</h3>
                  <p className="text-xs text-muted-foreground">{tx(robot.category, robot.category)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tx(robot.function, robot.function)}</p>
              <p className="text-xl font-bold text-primary">{robot.price}</p>
            </div>)}
        </div>

        {/* State-wise Robots */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            {tx('State-Wise Agricultural Machinery', 'राज्यवार कृषि मशीनरी')}
          </h2>
          <div className="space-y-8">
            {robotsByState.map((stateData, idx) => <div key={idx} className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  {tx(stateData.state, stateData.state)}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stateData.robots.map((robot, robotIdx) => <div key={robotIdx} className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <h4 className="text-xl font-bold text-foreground mb-3">{robot.name}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">{tx('Function:', 'कार्य:')}</strong> {tx(robot.function, robot.function)}
                        </p>
                        <p className="text-xl font-bold text-primary">{robot.price}</p>
                        <p className="text-sm text-green-600 font-semibold">{tx(robot.subsidy, robot.subsidy)}</p>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong className="text-foreground">{tx('Contact:', 'संपर्क:')}</strong>
                        </p>
                        <p className="text-sm text-foreground">{robot.contact}</p>
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default RoboticFarming;