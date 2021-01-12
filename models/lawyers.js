module.exports = function(sequelize, DataTypes) {
    let lawyer = sequelize.define("lawyer", { //table 정의
        userId : { //column 정의
            field : "userId",
            type : DataTypes.STRING(50),
            unique : true,
            allowNull : false
        },
        userPw : {
            field : "userPw",
            type : DataTypes.STRING(255)
        },
        name : {
            field : "name",
            type : DataTypes.STRING(20)
        },
        gender : {
            field : "gender",
            type : DataTypes.BOOLEAN
        },
        address : {
            field : "address",
            type : DataTypes.STRING(50)
        },
        registrationNum : {
            field : "registrationNUm",
            type : DataTypes.STRING(30)
        },
        accountNum : {
            field : "accountNum",
            type : DataTypes.STRING(30)
        },
        phone : {
            field : "phone",
            type : DataTypes.STRING(20),
        },
        like : {
            field : "like",
            type : DataTypes.INTEGER
        },
        transactions : {
            field : "transactions",
            type : DataTypes.INTEGER
        },
        uploads : {
            field : "uploads",
            type : DataTypes.INTEGER
        },
        provider : {
            field : "provider",
            type : DataTypes.STRING(10)
        }
    }, {
        //timestamps : false //createdAt, updatedAt 생성 X
        underscored : true, //column 이름을 camalCase가 아닌 underscore방식으로 사용
        freezeTableName : true, //define method의 첫번째 파라미터값을 tablename으로 자동변환 X
        tableName : "lawyer" //테이블명
    });
    return lawyer;
}