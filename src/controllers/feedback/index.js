export const getPrizesCountHandler = async (_req, res) => {
    const prizesDB = (await readDB("prizes"));
    return res.status(200).send({
        status: 200,
        data: {
            count: prizesDB?.length,
        },
        message: "Success",
    });
};