package com.sv.mdc.repository;

import com.sv.mdc.pojo.HebeiPermitsEntity;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HebeiRepository extends BaseRepository<HebeiPermitsEntity, Integer>, PagingAndSortingRepository<HebeiPermitsEntity, Integer> {
    HebeiPermitsEntity findEntityById(Integer id);
}
