const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const importData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/masjidannur');
    console.log('Connected to MongoDB');

    // Define the Schema and Model inline to avoid import issues
    const getModel = (name: string, schema: any) => {
      try {
        return mongoose.model(name);
      } catch {
        return mongoose.model(name, new mongoose.Schema(schema, { 
          strict: false // Allow fields not in schema
        }));
      }
    };

    // Define collections and their corresponding models
    const collections = {
      'masjidannur.abouts.json': getModel('About', {
        hero: { title: String, subtitle: String },
        sidebar: { image: String, visitTitle: String, visitDescription: String, address: String },
        journey: { title: String, content: [String] },
        mission: { title: String, content: String },
        services: { 
          title: String, 
          items: [{ 
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            title: String, 
            description: String 
          }] 
        },
        join: { title: String, content: String },
      }),
      'masjidannur.donationtypes.json': getModel('DonationType', {
        name: String,
        description: String,
        isActive: Boolean,
        icon: String,
      }),
      'masjidannur.events.json': getModel('Event', {
        title: String,
        description: String,
        date: Date,
        endDate: Date,
        location: String,
        image: String,
        category: [String],
        organizer: String,
        contactEmail: String,
        additionalDetails: String,
        isVisible: Boolean,
      }),
      'masjidannur.programs.json': getModel('Program', {
        title: String,
        description: String,
        image: String,
        fullDescription: String,
        schedule: String,
        contact: String,
      }),
      'masjidannur.ramadandates.json': getModel('RamadanDate', {
        date: Date,
        available: Boolean,
        sponsorId: String,
        sponsorName: String,
        notes: String,
        year: Number,
      }),
      'masjidannur.ramadanevents.json': getModel('RamadanEvent', {
        title: String,
        description: String,
        date: Date,
        isVisible: Boolean,
      }),
      'masjidannur.ramadanresources.json': getModel('RamadanResource', {
        title: String,
        description: String,
        resourceType: String,
        url: String,
        fileSize: String,
        category: String,
        isVisible: Boolean,
        order: Number,
        year: Number,
      }),
      'masjidannur.ramadansettings.json': getModel('RamadanSettings', {
        year: Number,
        startDate: Date,
        endDate: Date,
        iftarCost: Number,
        iftarCapacity: Number,
        iftarDescription: String,
        heroTitle: String,
        heroSubtitle: String,
        aboutTitle: String,
        aboutDescription: String,
        additionalInfo: [String],
        isActive: Boolean,
      }),
      'masjidannur.resources.json': getModel('Resource', {
        name: String,
        title: String,
        description: String,
        email: String,
        phone: String,
        image: String,
        isApproved: Boolean,
      }),
      'masjidannur.sitesettings.json': getModel('SiteSettings', {
        logo: String,
        siteName: String,
        siteLocation: String,
        headerMenuItems: [{
          id: String,
          name: String,
          href: String,
          enabled: Boolean,
          dropdown: Boolean,
          order: Number,
          items: [{
            id: String,
            name: String,
            href: String,
            order: Number,
          }],
        }],
        footerMenuItems: [{
          id: String,
          name: String,
          href: String,
          enabled: Boolean,
          order: Number,
        }],
        contactInfo: {
          address: String,
          phone: String,
          email: String,
        },
        copyrightText: String,
        developerInfo: {
          name: String,
          url: String,
          enabled: Boolean,
        },
        isActive: Boolean,
      }),
    };

    // Import each collection
    for (const [filename, Model] of Object.entries(collections)) {
      try {
        // Read JSON file
        const jsonPath = path.join(process.cwd(), 'data', filename);
        const fileContent = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Clear existing data
        await Model.deleteMany({});
        console.log(`Cleared existing ${filename} data`);

        // Convert MongoDB Extended JSON format
        const documents = Array.isArray(data) ? data : [data];
        const processedDocs = documents.map((doc: any) => {
          const processed = { ...doc };
          const convertDates = (obj: Record<string, any>): void => {
            for (const key in obj) {
              if (obj[key] && typeof obj[key] === 'object') {
                if (obj[key].$date) {
                  obj[key] = new Date(obj[key].$date);
                } else if (obj[key].$oid) {
                  obj[key] = obj[key].$oid;
                } else {
                  convertDates(obj[key]);
                }
              }
            }
          };
          convertDates(processed);
          return processed;
        });

        // Import new data
        await Model.insertMany(processedDocs, { lean: true });
        console.log(`Imported ${processedDocs.length} documents from ${filename}`);
      } catch (error) {
        console.error(`Error importing ${filename}:`, error);
      }
    }

    console.log('Data import completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

importData(); 