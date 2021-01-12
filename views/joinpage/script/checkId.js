window.onload = function() {
    $(document).ready(function() {
        var flag=0;

        $('#id').on("change keyup paste", function() {
            var idRegExp = /^[a-zA-z0-9]{4,12}$/;
            if(!idRegExp.test($('#id').val())) {
                flag=0;
            } else {
                flag=1;
            }
        });

        $('#check').click(function() {
            if(flag===1) {
                $.ajax({
                    url:'http://localhost/idChecked',
                    dataType:'json',
                    type:'post',
                    data : {data:$('#id').val()},
                    success:function(result) {
                        if(result.idCheck === 'legal') {
                            $('#idChecked').html("사용가능한 ID입니다.");
                        } else {
                            $('#idChecked').html("중복된 ID입니다.");
                        }
                    }
                });
            } else {
                alert('아이디는 영문 대소문자와 숫자를 조합하여 4~12자리로 입력해야합니다.');
            }
        });
    });
}