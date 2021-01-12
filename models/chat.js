module.exports = function(sequelize, DataTypes) {
    let chat = sequelize.define("chat", { //table 정의
        fromId : { //column 정의
            field : "fromId",
            type : DataTypes.STRING(50),
            allowNull : false
        },
        fromLawyer : { //column 정의
            field : "fromLawyer",
            type : DataTypes.STRING(10),
            allowNull : false
        },
        toId : {
            field : "toId",
            type : DataTypes.STRING(50),
            allowNull : false
        },
        toLawyer : { //column 정의
            field : "toLawyer",
            type : DataTypes.STRING(10),
            allowNull : false
        },
        msg : {
            field : "msg",
            type : DataTypes.STRING(100)
        },
        type : {
            field : "type",
            type : DataTypes.STRING(10),
            allowNull : false
        }
    }, {
        //timestamps : false //createdAt, updatedAt 생성 X
        underscored : true, //column 이름을 camalCase가 아닌 underscore방식으로 사용
        freezeTableName : true, //define method의 첫번째 파라미터값을 tablename으로 자동변환 X
        tableName : "chat" //테이블명
    });
    return chat;
}