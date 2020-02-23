const Test = require('../config/testConfig.js');

contract('FlightSuretyApp - pausing', async (accounts) => {
    let instance;
    let config;

    before(async () => {
        config = await Test.Config(accounts);
        instance = config.flightSuretyApp;
    });

    it("should be unpaused initially", async () => {
        const state = await instance.paused();

        assert.equal(state, false, "Contract should not be paused");
    });

    describe("after pausing", async () => {
        before(async () => {
            await instance.pause();
        });

        it("should be paused", async () => {
            const state = await instance.paused();

            assert.equal(state, true, "Contract should be paused");
        });

        it("should not allow calling registerOracle()", async () => {
            try {
                await instance.registerOracle();
                assert.fail("should throw error");
            } catch (e) {
                assert.equal(e.reason, "Pausable: paused")
            }
        });

        it("should not allow to be unpaused by anyone besides pauser", async () => {
            try {
                await instance.unpause({ from: config.firstAirline });
                assert.fail("should throw error");
            } catch (e) {
                assert.equal(e.reason, "PauserRole: caller does not have the Pauser role")
            }
        });

        describe("when unpausing", async () => {
            before(async () => {
                await instance.unpause({ from: config.owner });
            });

            it("should be unpaused again", async () => {
                const state = await instance.paused();

                assert.equal(state, false, "Contract should not be paused");
            });
        });
    });
});
