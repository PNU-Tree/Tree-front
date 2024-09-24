package tree.front.login.controller

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@Controller
class LoginController {

    @GetMapping("/login")
    fun renderLoginPage(model: Model): String {
        return "login/login"
    }

}
