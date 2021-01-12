//user table이 없으면 생성, 있으면 객체모델화
//id, createdAt, updatedAt 자동생성
module.exports = function(sequelize, DataTypes) {
    let User = sequelize.define("User", { //table 정의
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
        birth : {
            field : "birth",
            type : DataTypes.DATEONLY
        },
        gender : {
            field : "gender",
            type : DataTypes.BOOLEAN
        },
        address : {
            field : "address",
            type : DataTypes.STRING(50)
        },
        cardNum : {
            field : "cardNum",
            type : DataTypes.STRING(30)
        },
        phone : {
            field : "phone",
            type : DataTypes.STRING(20),
        },
        provider : {
            field : "provider",
            type : DataTypes.STRING(10)
        }
    }, {
        //timestamps : false //createdAt, updatedAt 생성 X
        underscored : true, //column 이름을 camalCase가 아닌 underscore방식으로 사용
        freezeTableName : true, //define method의 첫번째 파라미터값을 tablename으로 자동변환 X
        tableName : "User" //테이블명
    });
    return User;
}