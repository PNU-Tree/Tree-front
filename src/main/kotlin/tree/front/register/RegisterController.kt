package tree.front.register

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class RegisterController {

    @GetMapping("/register")
    fun renderRegisterPage(): String {
        return "register/register"
    }

}
