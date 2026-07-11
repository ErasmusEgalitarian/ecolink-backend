const mongoose = require('mongoose');
const { normalizeEcopointId } = require('../utils/pickupHelpers');

describe('pickupHelpers.normalizeEcopointId', () => {
    it('normalizes string ids to ObjectId', () => {
        const id = new mongoose.Types.ObjectId();
        const normalized = normalizeEcopointId(id.toString());

        expect(normalized).toBeInstanceOf(mongoose.Types.ObjectId);
        expect(normalized.toString()).toBe(id.toString());
    });

    it('keeps ObjectId instances unchanged', () => {
        const id = new mongoose.Types.ObjectId();
        expect(normalizeEcopointId(id)).toBe(id);
    });
});
