/**
 * 회원가입
 *
 * Developer : 김재찬
 */


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nickNameCheck, postUserSignup } from "../../api/userAPI";
import SignupValidation from "./validate/SignUpValidation";
import { alert } from '../../common/settings';
import { Button } from "react-bootstrap";
import { userApi } from "../../api/baseApi";

const SignUpComp = () => {
  const navigate = useNavigate();
  const {
    userEmail, setUserEmail, validateEmail, emailRegex,
    userPw, setUserPw, validatePassword, passwordRegex,
    userPwConfirm, setUserPwConfirm, validatePasswordConfirm,
    userName, setUserName,
    userBirthdate, setUserBirthdate, validateBirthdate,
    userPhone, setUserPhone, validatePhone, phoneRegex,
    userNickname, setUserNickname, validateNickname,
  } = SignupValidation();

  const [userRole, setUserRole] = useState("USER");

  // 유효성 검사 메시지 상태 추가
  const [emailError, setEmailError] = useState({message: "", color: "black"});
  const [passwordError, setPasswordError] = useState({message: "", color: "black"});
  const [passwordConfirmError, setPasswordConfirmError] = useState({message: "", color: "black"});
  const [birthDateError, setBirthDateError] = useState({message: "", color: "black"});
  const [phoneError, setPhoneError] = useState({message: "", color: "black"});
  const [nicknameError, setNicknameError] = useState({message: "", color: "black"});

  const handleChange = (e) => {
    const { id, value } = e.target;
    switch (id) {
      case "userEmail":
        setUserEmail(value);
        setEmailError(validateEmail(value)); // 오류 메시지 업데이트
        break;
      case "userPw":
        setUserPw(value);
        setPasswordError(validatePassword(value));
        setPasswordConfirmError(validatePasswordConfirm(userPwConfirm)); // 비밀번호 확인도 함께 검증
        break;
      case "userPwConfirm":
        setUserPwConfirm(value);
        setPasswordConfirmError(validatePasswordConfirm(value));
        break;
      case "userName":
        setUserName(value);
        break;
      case "userBirthdate":
        setUserBirthdate(value);
        setBirthDateError(validateBirthdate(value));
        break;
      case "userPhone":
        setUserPhone(value);
        setPhoneError(validatePhone(value));
        break;
      case "userNickname":
        setUserNickname(value);
        setNicknameError(validateNickname(value));
        break;
      case "userRole":
        setUserRole(value);
        break;
      default:
        break;
    }
  };
  const handleNicknameCheck = async () => {
    const result = await validateNickname(userNickname);
    setNicknameError(result);
  };

  const validateForm = async () => {

    if (!emailRegex || !emailRegex.test(userEmail)){
       console.log("이메일 유효성 검사 실패");
      return true;
    }
    if (!passwordRegex || !passwordRegex.test(userPw)) return false;
    if (userPw !== userPwConfirm) return false;
    if (!userBirthdate) return false;
    if (!phoneRegex || !phoneRegex.test(userPhone)) return false;

    // 닉네임 중복 검사 API 호출 (비동기 처리 필요)
    nickNameCheck({nickname: userNickname})
    .then((response) => {
      const { isAvailable } = response.data;
      if (!isAvailable) {
        console.log("닉네임 중복 검사 실패");
        return false;
      }
    }).catch(error => {
      console.error("닉네임 중복 검사 실패:", error);
      return false;
    })
    console.log("모든 유효성 검사 통과");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
       //console.log("handleSubmit 호출됨");
    const isValid = await validateForm();  //  비동기 함수 호출
      if (!isValid) {
        console.log("폼 제출 가능");
      } else {
        console.log("폼 유효성 검사 실패");
         alert('올바른 회원가입 요청이 아닙니다.');
        return;
      }
    const user = { userEmail, userPw, userName, userBirthdate, userPhone, userNickname, userRole };
    postUserSignup(user).then((response) => {
      console.log(response);
      if (response === "회원가입 성공") {
        alert("회원가입 성공했습니다.");
        navigate("/user/login");
      }
    }).catch(error => {
        if (userApi.isAxiosError(error)) {
          const errorMessage = error.response?.data || '회원가입 오류가 발생했습니다.';
          alert(errorMessage);
        }  else {
          alert("알 수 없는 오류가 있습니다.");
          }
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '450px' }}>
        <h3 className="text-center mb-4">회원가입</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            {/* 이메일 */}
            <input type="text" id="userEmail" value={userEmail} placeholder="이메일@example.com" className="form-control" onChange={(e) => {
              setUserEmail(e.target.value);
              const validation = validateEmail(e.target.value);
              setEmailError(validation);
            }} required/>
            <span style={{ color: emailError.color, fontSize: '0.875rem' }}>{emailError.message}</span>
          </div>

          <div className="mb-3">
            {/* 비밀번호 */}
            <input type="password" id="userPw" value={userPw} placeholder="비밀번호(최소 8자이상)" className="form-control" onChange={(e) => {
              setUserPw(e.target.value);
              const validation = validatePassword(e.target.value);
              setPasswordError(validation);
            }} />
            <span style={{ color: passwordError.color, fontSize: '0.875rem' }}>{passwordError.message}</span>
          </div>

          <div className="mb-3">
            {/* 비밀번호 확인 */}
            <input type="password" id="userPwConfirm" value={userPwConfirm} placeholder="비밀번호 확인"  className="form-control" onChange={(e) => {
              setUserPwConfirm(e.target.value);
              const validation = validatePasswordConfirm(e.target.value);
              setPasswordConfirmError(validation);
            }} />
            <span style={{ color: passwordConfirmError.color, fontSize: '0.875rem' }}>{passwordConfirmError.message}</span>
          </div>

          <div className="mb-3">
            {/* 이름 */}
            <input type="text" id="userName" value={userName} placeholder="이름" className="form-control" onChange={handleChange} />
          </div>

          <div className="mb-3">
            {/* 생년월일 */}
            <input type="date" id="userBirthdate" value={userBirthdate} placeholder="생년월일" className="form-control" onChange={(e) => {
              setUserBirthdate(e.target.value);
              const validation = validateBirthdate(e.target.value);
              setBirthDateError(validation);
            }} />
            <span style = {{ color: birthDateError.color, fontSize: '0.875rem' }}>{birthDateError.message}</span>
          </div>

          <div className="mb-3">
            {/* 전화번호 */}
            <input type="tel" id="userPhone" value={userPhone} placeholder="010부터 입력해주세요." className="form-control" onChange={(e) => {
              setUserPhone(e.target.value);
              const validation = validatePhone(e.target.value);
              setPhoneError(validation);
            }} />
            <span style={{ color: phoneError.color, fontSize: '0.875rem' }}>{phoneError.message}</span>
          </div>

          <div className="mb-3">
            {/* 닉네임 */}
            <input type="text" id="userNickname" value={userNickname} placeholder="닉네임" className="form-control" onChange={(e) => {
              setUserNickname(e.target.value);
              const validation = validateNickname(e.target.value);
              setNicknameError(validation);
            }} />
            <button type="button" onClick={handleNicknameCheck}> 중복 확인 </button>
            <span style={{ color: nicknameError.color, fontSize: '0.875rem' }}>{nicknameError.message}</span>
          </div>

          <div className="mb-3">
            {/* 권한 선택 */}
            <select id="userRole" value={userRole} onChange={handleChange}>
              <option value="ADMIN">관리자</option>
              <option value="USER">일반회원</option>
            </select>
          </div>

          {/* 회원가입 버튼 */}
          <Button variant="primary" type="submit">회원가입</Button>
        </form>
      </div>
    </div>
  );
  /*const navigate = useNavigate();

  const [user, setUser] = useState({
    userEmail: "",
    userPw: "",
    userName: "",
    userBirthdate: "",
    userPhone: "",
    userNickname: "",
    userRole: "USER",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUser({ ...user, [id]: value });
  };

  const validateForm = () => {
    const { userEmail, userPw, userName, userBirthdate, userPhone, userNickname } = user;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?!.*\s).{8,}$/; // 최소 8자 이상, 최소한 하나의 대문자, 하나의 소문자, 하나의 숫자, 하나의 특수문자를 포함, 공백 허용하지 않음
    const nameRegex = /^[가-힣a-zA-Z]+$/; // 한글 또는 영문만 허용
    const phoneRegex = /^010\d{4}\d{4}$/; // 010xxxxxxxx 형태
    const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,10}$/; // 특수문자 제외 (2~10자)

    if (!emailRegex.test(userEmail)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    if (!passwordRegex.test(userPw)) {
      alert('비밀번호는 최소 8자, 영문과 숫자를 포함해야 합니다.');
      return false;
    }
    if (!nameRegex.test(userName)) {
      alert('이름은 한글 또는 영문만 입력 가능합니다.');
      return false;
    }
    if (userBirthdate) {
      const today = new Date();
      const birthDate = new Date(userBirthdate);
      if (birthDate > today) {
        alert('생년월일을 올바르게 입력하세요.');
        return false;
      }
    }
    if (!phoneRegex.test(userPhone)) {
      alert('전화번호는 010xxxxxxxx 형식으로 입력해주세요.');
      return false;
    }
    if (!nicknameRegex.test(userNickname)) {
      alert('닉네임은 2~10자, 특수문자를 제외한 문자와 숫자만 사용 가능합니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await signup(user);
      if (response.status === 200) {
        alert("회원가입 성공");
        navigate("/user/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert("회원가입 오류입니다.");
      }
    }
  };

  return (
    <div>
      <h3>회원가입</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" id="userEmail" value={user.userEmail} placeholder="이메일" onChange={handleChange} />
        <br/>
        <input type="password" id="userPw" value={user.userPw} placeholder="비밀번호" onChange={handleChange} />
        <br/>
        <input type="text" id="userName" value={user.userName} placeholder="이름" onChange={handleChange} />
        <br/>
        <input type="date" id="userBirthdate" value={user.userBirthdate} placeholder="생년월일" onChange={handleChange} />
        <br/>
        <input type="tel" id="userPhone" value={user.userPhone} placeholder="전화번호 (010-xxxx-xxxx)" onChange={handleChange} />
        <br/>
        <input type="text" id="userNickname" value={user.userNickname} placeholder="닉네임" onChange={handleChange} />
        <br/>
        <select id="userRole" value={user.userRole} onChange={handleChange}>
          <option value="ADMIN">관리자</option>
          <option value="USER">일반회원</option>
        </select><br />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );*/
};

export default SignUpComp;