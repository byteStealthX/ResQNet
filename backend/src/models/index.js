const User = require('./User');
const Incident = require('./Incident');

// Define Associations
User.hasMany(Incident, {
    foreignKey: 'reporterId',
    as: 'reportedIncidents'
});

User.hasMany(Incident, {
    foreignKey: 'assignedResponderId',
    as: 'assignedIncidents'
});

Incident.belongsTo(User, {
    foreignKey: 'reporterId',
    as: 'reporter'
});

Incident.belongsTo(User, {
    foreignKey: 'assignedResponderId',
    as: 'assignedResponder'
});

module.exports = {
    User,
    Incident
};
