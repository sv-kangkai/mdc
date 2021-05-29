package com.sv.mdc.service.impl;

import com.sv.mdc.pojo.HebeiPermitsEntity;
import com.sv.mdc.repository.HebeiRepository;
import com.sv.mdc.service.HebeiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HebeiServiceImpl implements HebeiService {
    @Autowired
    HebeiRepository heBeiRepository;

    @Override
    public HebeiPermitsEntity findEntityById(Integer id) {
        return heBeiRepository.findEntityById(id);
//        return null;
    }

    @Override
    public List<HebeiPermitsEntity> findAllEntities() {
        return heBeiRepository.findAll();
    }
}
