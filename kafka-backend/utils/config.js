const config = {
    secret: "cmpe273_secret_key",
    mongoDB: 'mongodb+srv://admin:admin123@cluster0.mfoom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    login_topic: 'login_topic',
    group_topic: 'group_topic',
    expense_topic: 'expense_topic',
    recent_topic: 'recent_topic'

   
};

module.exports = config;