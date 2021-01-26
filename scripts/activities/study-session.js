const StudySession = require("mongoose").model("StudySession");
const { react } = require("../../utils/react");
const { STUDY_SESSION } = require("../../constants/studySession");
const { replyInfo, replySuccess, replyError, replySurvey } = require("../../utils/reply");

function getStudySessionDate(text) {
    // Regex Declaration
    const dateRgx = /(\d{4}[-|\/]\d{2}[-|\/]\d{2})/g; // YYYY-MM-DD | YYYY/MM/DD
    const timeRgx = /(?<hour>\d{2}:\d{2})\s?(?<ampm>am|pm)?/gi; // HH:mm | HH:mm am | HH:mm pm

    // Catching information from message
    const date = dateRgx.exec(text)?.[1];
    const {hour, ampm = ''} = timeRgx.exec(text)?.groups ?? {};

    return new Date(`${date} ${hour} ${ampm}`);
}

function getStudySessionEstimatedLength(text) {
    // Regex Declaration
    const hoursRgx = /(\d)\s?hour/; // h hour(s)
    const minutesRgx = /(\d{1,2})\s?min/; // mm min(utes)

    // Catching information from message
    const estimatedLengthHours = hoursRgx.exec(text)?.[1];
    const estimatedLengthMinutes = minutesRgx.exec(text)?.[1];

    return estimatedLengthHours ? estimatedLengthHours * 60 : estimatedLengthMinutes;
}

function getStudySession(message) {
    const text = message.content.toLowerCase();
    const id = message.id;
    const author = {
        id: message.author.id,
        username: message.author.username
    };
    const startDate = getStudySessionDate(text);
    const estimatedLength = getStudySessionEstimatedLength(text);

    // Return an error message if study session's start date valid
    if (isNaN(startDate.getDate())) return replyError(message, STUDY_SESSION.CREATE.MISSING_DATE);
    if (startDate < new Date()) return replyError(message, STUDY_SESSION.CREATE.DATE_PAST);

    return { id, author, startDate, estimatedLength };
}

function createStudySession(message) {
    const studySession = getStudySession(message);
    StudySession.create(studySession)
        .then(() => {
            replySuccess(message, STUDY_SESSION.CREATE.SUCCESS(studySession), {embed: true});
            react(message, null, ["⭐", "❌"]);
        })
        .catch((error) => replyError(message, STUDY_SESSION.CREATE.ERROR(error)));
}

function getUpcomingStudySessions(message) {
    StudySession.find({startDate: {$gt: new Date()}}, (error, studySessions) => {
        if (error) return replyError(message, STUDY_SESSION.UPCOMING.ERROR(error));
        if (studySessions.length === 0) return replyError(message, STUDY_SESSION.UPCOMING.NOT_FOUND);
        return replySuccess(message, STUDY_SESSION.UPCOMING.SUCCESS(studySessions));
    });
}

function subscribeStudySession(message, user) {
    StudySession.findOneAndUpdate({id: message.id}, {$push: {subscribersId: user.id}})
        .then(() => replySuccess(message, STUDY_SESSION.SUBSCRIBE.SUCCESS(message.author, user)))
        .catch((error) => replyError(message, STUDY_SESSION.SUBSCRIBE.ERROR(error)));
}

function unsubscribeStudySession(message, user) {
    StudySession.findOneAndUpdate({id: message.id}, {$pull: {subscribersId: user.id}})
        .then(() => replySuccess(message, STUDY_SESSION.UNSUBSCRIBE.SUCCESS(message.author, user)))
        .catch((error) => replyError(message, STUDY_SESSION.UNSUBSCRIBE.ERROR(error)));
}

function cancelConfirmationStudySession(message, user) {
    if (message.author.id !== user.id) replyError(STUDY_SESSION.CANCEL.UNAUTHORIZED);
    replySurvey(message, user, STUDY_SESSION.CANCEL.CONFIRMATION(user), ["✅", "❌"], 60000)
        .then((result) => {
            switch (result) {
                case "✅": return cancelStudySession(message, user);
                case "❌": return replyInfo(message, STUDY_SESSION.CANCEL.CANCEL);
                default: return replyInfo(message, STUDY_SESSION.CANCEL.TIME_ELAPSED);
            }
        })
        .catch((error) => replyError(message, STUDY_SESSION.CANCEL.ERROR(error)));
}

function cancelStudySession(message, user) {
    StudySession.findOneAndDelete({id: message.id})
        .then(() => replySuccess(message, STUDY_SESSION.CANCEL.SUCCESS(user)))
        .catch((error) => replyError(message, STUDY_SESSION.CANCEL.ERROR(error)));
}

module.exports = { createStudySession, getUpcomingStudySessions, subscribeStudySession, unsubscribeStudySession, cancelConfirmationStudySession };