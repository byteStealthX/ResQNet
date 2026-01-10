import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Ambulance, { AmbulanceType, AmbulanceStatus } from '../models/Ambulance';
import Hospital from '../models/Hospital';
import Resource, { ResourceType, ResourceCategory } from '../models/Resource';
import Emergency, { EmergencyType, EmergencySeverity, EmergencyStatus } from '../models/Emergency';
import logger from '../utils/logger.util';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resqnet';

const mumbaiHospitals = [
    {
        name: 'Lilavati Hospital',
        location: { type: 'Point', coordinates: [72.8311, 19.0521] },
        address: { street: 'A-791, Bandra Reclamation', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050', country: 'India' },
        contact: { phone: '+912226405000', emergencyLine: '+912226405001', email: 'emergency@lilavatihospital.com' },
        capacity: { totalBeds: 300, availableBeds: 45, icuBeds: 50, availableICUBeds: 8, emergencyBeds: 40, availableEmergencyBeds: 12 },
        departments: ['Emergency', 'Cardiology', 'Neurology', 'Trauma', 'ICU'],
        specializations: ['cardiac', 'trauma', 'stroke'],
        traumaLevel: 1,
        ratings: { overall: 4.5, emergencyCare: 4.7 }
    },
    {
        name: 'KEM Hospital',
        location: { type: 'Point', coordinates: [72.8406, 19.0096] },
        address: { street: 'Acharya Donde Marg, Parel', city: 'Mumbai', state: 'Maharashtra', zipCode: '400012', country: 'India' },
        contact: { phone: '+912224107000', emergencyLine: '+912224107001', email: 'emergency@kem.edu' },
        capacity: { totalBeds: 500, availableBeds: 80, icuBeds: 70, availableICUBeds: 15, emergencyBeds: 60, availableEmergencyBeds: 20 },
        departments: ['Emergency', 'Trauma', 'Burns', 'General Surgery', 'ICU'],
        specializations: ['trauma', 'burn', 'accident'],
        traumaLevel: 1,
        ratings: { overall: 4.3, emergencyCare: 4.5 }
    },
    {
        name: 'Hinduja Hospital',
        location: { type: 'Point', coordinates: [72.8095, 19.0550] },
        address: { street: 'Veer Savarkar Marg, Mahim', city: 'Mumbai', state: 'Maharashtra', zipCode: '400016', country: 'India' },
        contact: { phone: '+912224447000', emergencyLine: '+912224447001', email: 'emergency@hindujahospital.com' },
        capacity: { totalBeds: 350, availableBeds: 55, icuBeds: 60, availableICUBeds: 12, emergencyBeds: 45, availableEmergencyBeds: 15 },
        departments: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'ICU'],
        specializations: ['cardiac', 'respiratory', 'stroke'],
        traumaLevel: 2,
        ratings: { overall: 4.6, emergencyCare: 4.8 }
    },
    {
        name: 'Jaslok Hospital',
        location: { type: 'Point', coordinates: [72.8099, 18.9645] },
        address: { street: '15, Dr. G Deshmukh Marg, Pedder Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400026', country: 'India' },
        contact: { phone: '+912266573333', emergencyLine: '+912266573334', email: 'emergency@jaslokhospital.net' },
        capacity: { totalBeds: 400, availableBeds: 70, icuBeds: 65, availableICUBeds: 14, emergencyBeds: 50, availableEmergencyBeds: 18 },
        departments: ['Emergency', 'Cardiology', 'Neurosurgery', 'Trauma', 'ICU'],
        specializations: ['cardiac', 'trauma', 'poisoning'],
        traumaLevel: 2,
        ratings: { overall: 4.4, emergencyCare: 4.6 }
    },
    {
        name: 'Breach Candy Hospital',
        location: { type: 'Point', coordinates: [72.8046, 18.9712] },
        address: { street: '60-A, Bhulabhai Desai Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400026', country: 'India' },
        contact: { phone: '+912223667788', emergencyLine: '+912223667789', email: 'emergency@breachcandyhospital.org' },
        capacity: { totalBeds: 280, availableBeds: 40, icuBeds: 45, availableICUBeds: 10, emergencyBeds: 35, availableEmergencyBeds: 10 },
        departments: ['Emergency', 'General Medicine', 'Surgery', 'ICU'],
        specializations: ['respiratory', 'accident'],
        traumaLevel: 3,
        ratings: { overall: 4.2, emergencyCare: 4.4 }
    }
];

const mumbaiAmbulances = [
    { number: 'AMB-101', type: AmbulanceType.ALS, currentLocation: { type: 'Point', coordinates: [72.8777, 19.0760] }, baseLocation: { type: 'Point', coordinates: [72.8777, 19.0760] }, crew: { driver: 'Rajesh Kumar', paramedic: 'Dr. Sharma' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-1234', model: 'Tata Winger', year: 2022 } },
    { number: 'AMB-102', type: AmbulanceType.BLS, currentLocation: { type: 'Point', coordinates: [72.8258, 19.0896] }, baseLocation: { type: 'Point', coordinates: [72.8258, 19.0896] }, crew: { driver: 'Suresh Patil', paramedic: 'Nurse Priya' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-5678', model: 'Force Traveller', year: 2021 } },
    { number: 'AMB-103', type: AmbulanceType.ALS, currentLocation: { type: 'Point', coordinates: [72.8326, 19.1136] }, baseLocation: { type: 'Point', coordinates: [72.8326, 19.1136] }, crew: { driver: 'Amit Singh', paramedic: 'Dr. Mehta' }, status: AmbulanceStatus.EN_ROUTE, metadata: { vehicleRegistration: 'MH-01-AB-9012', model: 'Tata Winger', year: 2023 } },
    { number: 'AMB-104', type: AmbulanceType.CCT, currentLocation: { type: 'Point', coordinates: [72.8561, 19.0176] }, baseLocation: { type: 'Point', coordinates: [72.8561, 19.0176] }, crew: { driver: 'Dinesh Pawar', paramedic: 'Dr. Gupta', assistant: 'Nurse Anjali' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-3456', model: 'Mercedes Sprinter', year: 2023 } },
    { number: 'AMB-105', type: AmbulanceType.BLS, currentLocation: { type: 'Point', coordinates: [72.8311, 18.9389] }, baseLocation: { type: 'Point', coordinates: [72.8311, 18.9389] }, crew: { driver: 'Prakash More', paramedic: 'Nurse Kavita' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-7890', model: 'Force Traveller', year: 2022 } },
    { number: 'AMB-106', type: AmbulanceType.ALS, currentLocation: { type: 'Point', coordinates: [72.9000, 19.1000] }, baseLocation: { type: 'Point', coordinates: [72.9000, 19.1000] }, crew: { driver: 'Vijay Desai', paramedic: 'Dr. Rao' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-2345', model: 'Tata Winger', year: 2023 } },
    { number: 'AMB-107', type: AmbulanceType.BLS, currentLocation: { type: 'Point', coordinates: [72.8500, 19.0500] }, baseLocation: { type: 'Point', coordinates: [72.8500, 19.0500] }, crew: { driver: 'Kiran Joshi', paramedic: 'Nurse Sunita' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-6789', model: 'Force Traveller', year: 2021 } },
    { number: 'AMB-108', type: AmbulanceType.ALS, currentLocation: { type: 'Point', coordinates: [72.8200, 19.0200] }, baseLocation: { type: 'Point', coordinates: [72.8200, 19.0200] }, crew: { driver: 'Ramesh Naik', paramedic: 'Dr. Iyer' }, status: AmbulanceStatus.ON_SCENE, metadata: { vehicleRegistration: 'MH-01-AB-0123', model: 'Tata Winger', year: 2022 } },
    { number: 'AMB-109', type: AmbulanceType.BLS, currentLocation: { type: 'Point', coordinates: [72.8700, 19.0700] }, baseLocation: { type: 'Point', coordinates: [72.8700, 19.0700] }, crew: { driver: 'Santosh Kamble', paramedic: 'Nurse Rekha' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-4567', model: 'Force Traveller', year: 2023 } },
    { number: 'AMB-110', type: AmbulanceType.CCT, currentLocation: { type: 'Point', coordinates: [72.8400, 18.9800] }, baseLocation: { type: 'Point', coordinates: [72.8400, 18.9800] }, crew: { driver: 'Mahesh Kulkarni', paramedic: 'Dr. Nair', assistant: 'Nurse Pooja' }, status: AmbulanceStatus.AVAILABLE, metadata: { vehicleRegistration: 'MH-01-AB-8901', model: 'Mercedes Sprinter', year: 2023 } }
];

const seedDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to database');

        await Promise.all([
            User.deleteMany({}),
            Ambulance.deleteMany({}),
            Hospital.deleteMany({}),
            Resource.deleteMany({}),
            Emergency.deleteMany({})
        ]);
        logger.info('Cleared existing data');

        const users = await User.create([
            { email: 'admin@resqnet.com', password: 'Admin@123', firstName: 'System', lastName: 'Admin', phone: '+919876543210', role: UserRole.ADMIN },
            { email: 'dispatcher@resqnet.com', password: 'Dispatch@123', firstName: 'Emergency', lastName: 'Dispatcher', phone: '+919876543211', role: UserRole.PARAMEDIC },
            { email: 'hospital@resqnet.com', password: 'Hospital@123', firstName: 'Hospital', lastName: 'Admin', phone: '+919876543212', role: UserRole.HOSPITAL_ADMIN },
            { email: 'patient1@resqnet.com', password: 'Patient@123', firstName: 'John', lastName: 'Doe', phone: '+919876543213', role: UserRole.PATIENT },
            { email: 'patient2@resqnet.com', password: 'Patient@123', firstName: 'Jane', lastName: 'Smith', phone: '+919876543214', role: UserRole.PATIENT }
        ]);
        logger.info(`✅ Created ${users.length} users`);

        const resources = await Resource.create([
            { name: 'Defibrillator', type: ResourceType.EQUIPMENT, category: ResourceCategory.CARDIAC, description: 'Automated External Defibrillator', quantity: 10, unit: 'units', criticalLevel: 2 },
            { name: 'Ventilator', type: ResourceType.EQUIPMENT, category: ResourceCategory.RESPIRATORY, description: 'Mechanical Ventilator', quantity: 5, unit: 'units', criticalLevel: 1 },
            { name: 'Trauma Kit', type: ResourceType.SUPPLY, category: ResourceCategory.TRAUMA, description: 'Complete trauma care kit', quantity: 20, unit: 'kits', criticalLevel: 5 },
            { name: 'Oxygen Cylinder', type: ResourceType.SUPPLY, category: ResourceCategory.RESPIRATORY, description: 'Portable oxygen cylinder', quantity: 50, unit: 'cylinders', criticalLevel: 10 }
        ]);
        logger.info(`✅ Created ${resources.length} resources`);

        const hospitals = await Hospital.create(mumbaiHospitals.map(h => ({ ...h, resources: resources.map(r => r._id), acceptingEmergencies: true, isOperational: true, lastMaintenanceDate: new Date() })));
        logger.info(`✅ Created ${hospitals.length} hospitals`);

        const ambulances = await Ambulance.create(mumbaiAmbulances.map(a => ({ ...a, equipment: resources.slice(0, 2).map(r => r._id), isOperational: true, lastMaintenanceDate: new Date() })));
        logger.info(`✅ Created ${ambulances.length} ambulances`);

        const emergencies = await Emergency.create([
            {
                reporterId: users[3]._id,
                type: EmergencyType.CARDIAC,
                severity: EmergencySeverity.CRITICAL,
                status: EmergencyStatus.COMPLETED,
                description: 'Chest pain, difficulty breathing',
                location: { type: 'Point', coordinates: [72.8777, 19.0760] },
                address: 'Andheri East, Mumbai',
                patientInfo: { name: 'Ramesh Kumar', age: 65, gender: 'Male', phone: '+919876543220' },
                timeline: { reported: new Date(Date.now() - 86400000), triaged: new Date(Date.now() - 86300000), dispatched: new Date(Date.now() - 86200000), arrivedOnScene: new Date(Date.now() - 86000000), departedToHospital: new Date(Date.now() - 85800000), arrivedAtHospital: new Date(Date.now() - 85400000), completed: new Date(Date.now() - 84000000) }
            },
            {
                reporterId: users[4]._id,
                type: EmergencyType.ACCIDENT,
                severity: EmergencySeverity.HIGH,
                status: EmergencyStatus.TRANSPORTING,
                description: 'Road traffic accident, multiple injuries',
                location: { type: 'Point', coordinates: [72.8258, 19.0896] },
                address: 'Bandra West, Mumbai',
                patientInfo: { name: 'Priya Sharma', age: 28, gender: 'Female', phone: '+919876543221' },
                timeline: { reported: new Date(Date.now() - 3600000), triaged: new Date(Date.now() - 3500000), dispatched: new Date(Date.now() - 3400000), arrivedOnScene: new Date(Date.now() - 3000000), departedToHospital: new Date(Date.now() - 2700000) },
                assignedAmbulanceId: ambulances[0]._id,
                assignedHospitalId: hospitals[0]._id
            }
        ]);
        logger.info(`✅ Created ${emergencies.length} emergencies`);

        logger.info('🎉 Database seeded successfully!');
        logger.info('\n📝 Sample Credentials:');
        logger.info('Admin: admin@resqnet.com / Admin@123');
        logger.info('Dispatcher: dispatcher@resqnet.com / Dispatch@123');
        logger.info('Hospital: hospital@resqnet.com / Hospital@123');
        logger.info('Patient: patient1@resqnet.com / Patient@123');

        await mongoose.disconnect();
        logger.info('Disconnected from database');
        process.exit(0);
    } catch (error) {
        logger.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
