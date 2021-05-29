package com.sv.mdc.service;

import com.sv.mdc.pojo.HebeiPermitsEntity;

import java.util.List;

public interface HebeiService {
    HebeiPermitsEntity findEntityById(Integer id);
    List<HebeiPermitsEntity> findAllEntities();
}
