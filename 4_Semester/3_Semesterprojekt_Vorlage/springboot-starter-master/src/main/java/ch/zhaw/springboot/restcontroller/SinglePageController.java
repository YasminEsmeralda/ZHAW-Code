package ch.zhaw.springboot.restcontroller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * This controller enables proper routing (page refresh and entering URLs
 * directly in the browser's address bar) for the Vue front-end. 
 * 
 * It works by routing error pages to /index.html which allows Vue to handle
 * the routes.
 */
@Controller
public class SinglePageController implements ErrorController{

	// Forward the request to "/", so that Vue handles the path.
	// The URL won't change in the browser.
	// SEE: https://www.baeldung.com/spring-redirect-and-forward
    @RequestMapping(value = "/error")
    public String error() {
        return "forward:/";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}