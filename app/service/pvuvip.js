'use strict';

const Service = require('egg').Service;

class PvuvipService extends Service {

    getPvUvIpByDataTime(dataTime) {
        return this.ctx.model.Pvuvip.count({
            data_time: dataTime,
        }).exec();
    }

    /*
     * 根据用户ID，获取未读消息的数量
     * Callback:
     * @param {String} id 用户ID
     * @return {Promise[messagesCount]} 承载消息列表的 Promise 对象
     */
    getMessagesCount(id) {
        return this.ctx.model.Message.count({
            master_id: id,
            has_read: false,
        }).exec();
    }

    async getMessageRelations(message) {
        if (
            message.type === 'reply' ||
            message.type === 'reply2' ||
            message.type === 'at'
        ) {
            const [author, topic, reply] = await Promise.all([
                this.service.user.getUserById(message.author_id),
                this.service.topic.getTopicById(message.topic_id),
                this.service.reply.getReplyById(message.reply_id),
            ]);

            message.author = author;
            message.topic = topic;
            message.reply = reply;

            if (!author || !topic) {
                message.is_invalid = true;
            }

            return message;
        }

        return { is_invalid: true };
    }

    /*
     * 根据消息Id获取消息
     * @param {String} id 消息ID
     * @return {Promise[message]} 承载消息的 Promise 对象
     */
    async getMessageById(id) {
        const message = await this.ctx.model.Message.findOne({ _id: id }).exec();
        return this.getMessageRelations(message);
    }

    /*
     * 根据用户ID，获取已读消息列表
     * @param {String} userId 用户ID
     * @return {Promise[messages]} 承载消息列表的 Promise 对象
     */
    getReadMessagesByUserId(userId) {
        const query = { master_id: userId, has_read: true };
        return this.ctx.model.Message.find(query, null, {
            sort: '-create_at',
            limit: 20,
        }).exec();
    }

    /*
     * 根据用户ID，获取未读消息列表
     * @param {String} userId 用户ID
     * @return {Promise[messages]} 承载消息列表的 Promise 对象
     */
    getUnreadMessagesByUserId(userId) {
        const query = { master_id: userId, has_read: false };
        return this.ctx.model.Message.find(query, null, {
            sort: '-create_at',
        }).exec();
    }

    /*
     * 将消息设置成已读
     * @return {Promise[messages]} 承载消息列表的 Promise 对象
     */
    async updateMessagesToRead(userId, messages) {
        if (messages.length === 0) {
            return;
        }

        const ids = messages.map(function (m) {
            return m.id;
        });

        const query = { master_id: userId, _id: { $in: ids } };
        const update = { $set: { has_read: true } };
        const opts = { multi: true };
        return this.ctx.model.Message.update(query, update, opts).exec();
    }

    /**
     * 将单个消息设置成已读
     * @param {String} msgId 消息 ID
     * @return {Promise} 更新消息返回的 Promise 对象
     */
    async updateOneMessageToRead(msgId) {
        if (!msgId) {
            return;
        }
        const query = { _id: msgId };
        const update = { $set: { has_read: true } };
        return this.ctx.model.Message.update(query, update, { multi: true }).exec();
    }

    async sendAtMessage(userId, authorId, topicId, replyId) {
        const message = this.ctx.model.Message();

        message.type = 'at';
        message.master_id = userId;
        message.author_id = authorId;
        message.topic_id = topicId;
        message.reply_id = replyId;

        return message.save();
    }

    async sendReplyMessage(userId, authorId, topicId, replyId) {
        const message = this.ctx.model.Message();

        message.type = 'reply';
        message.master_id = userId;
        message.author_id = authorId;
        message.topic_id = topicId;
        message.reply_id = replyId;

        return message.save();
    }
}

module.exports = PvuvipService;
