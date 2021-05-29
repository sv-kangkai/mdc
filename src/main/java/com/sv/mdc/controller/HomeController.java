package com.sv.mdc.controller;

import com.sv.mdc.pojo.HebeiPermitsEntity;
import com.sv.mdc.service.HebeiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
public class HomeController {
    @Autowired
    HebeiService hebeiService;

    @GetMapping("/")
    public ModelAndView home1() {
        HebeiPermitsEntity entity = hebeiService.findEntityById(Integer.valueOf("838"));
        ModelAndView modelAndView = new ModelAndView("home1");
        modelAndView.addObject("hebeiEntity", entity);
        return modelAndView;
    }

    @ResponseBody
    @GetMapping("/findHebeiAllEntities")
    public List<HebeiPermitsEntity> findAllEntities(){
        return this.hebeiService.findAllEntities();
    }
}
