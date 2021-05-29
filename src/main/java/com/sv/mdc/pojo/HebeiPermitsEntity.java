package com.sv.mdc.pojo;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "hebei_permits", schema = "mdc_info_sys")
public class HebeiPermitsEntity {
    private int id;
    private String caseCode;
    private String casePermitsCode;
    private String entpUscc;
    private String applyCompanyName;
    private String grantType;
    private String grantProjectName;
    private Timestamp beginValidDate;
    private Timestamp endValidDate;
    private String categoryName;
    private String applyName;
    private Timestamp signatureDate;
    private String signAddress;
    private String operationAddress;

    @Id
    @Column(name = "id", nullable = false)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Basic
    @Column(name = "case_code", nullable = true, length = 20)
    public String getCaseCode() {
        return caseCode;
    }

    public void setCaseCode(String caseCode) {
        this.caseCode = caseCode;
    }

    @Basic
    @Column(name = "case_permits_code", nullable = true, length = 200)
    public String getCasePermitsCode() {
        return casePermitsCode;
    }

    public void setCasePermitsCode(String casePermitsCode) {
        this.casePermitsCode = casePermitsCode;
    }

    @Basic
    @Column(name = "entp_uscc", nullable = true, length = 20)
    public String getEntpUscc() {
        return entpUscc;
    }

    public void setEntpUscc(String entpUscc) {
        this.entpUscc = entpUscc;
    }

    @Basic
    @Column(name = "apply_company_name", nullable = true, length = 100)
    public String getApplyCompanyName() {
        return applyCompanyName;
    }

    public void setApplyCompanyName(String applyCompanyName) {
        this.applyCompanyName = applyCompanyName;
    }

    @Basic
    @Column(name = "grant_type", nullable = true, length = 20)
    public String getGrantType() {
        return grantType;
    }

    public void setGrantType(String grantType) {
        this.grantType = grantType;
    }

    @Basic
    @Column(name = "grant_project_name", nullable = true, length = 500)
    public String getGrantProjectName() {
        return grantProjectName;
    }

    public void setGrantProjectName(String grantProjectName) {
        this.grantProjectName = grantProjectName;
    }

    @Basic
    @Column(name = "begin_valid_date", nullable = true)
    public Timestamp getBeginValidDate() {
        return beginValidDate;
    }

    public void setBeginValidDate(Timestamp beginValidDate) {
        this.beginValidDate = beginValidDate;
    }

    @Basic
    @Column(name = "end_valid_date", nullable = true)
    public Timestamp getEndValidDate() {
        return endValidDate;
    }

    public void setEndValidDate(Timestamp endValidDate) {
        this.endValidDate = endValidDate;
    }

    @Basic
    @Column(name = "category_name", nullable = true, length = 255)
    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    @Basic
    @Column(name = "apply_name", nullable = true, length = 500)
    public String getApplyName() {
        return applyName;
    }

    public void setApplyName(String applyName) {
        this.applyName = applyName;
    }

    @Basic
    @Column(name = "signature_date", nullable = true)
    public Timestamp getSignatureDate() {
        return signatureDate;
    }

    public void setSignatureDate(Timestamp signatureDate) {
        this.signatureDate = signatureDate;
    }

    @Basic
    @Column(name = "sign_address", nullable = true, length = 500)
    public String getSignAddress() {
        return signAddress;
    }

    public void setSignAddress(String signAddress) {
        this.signAddress = signAddress;
    }

    @Basic
    @Column(name = "operation_address", nullable = true, length = 500)
    public String getOperationAddress() {
        return operationAddress;
    }

    public void setOperationAddress(String operationAddress) {
        this.operationAddress = operationAddress;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        HebeiPermitsEntity that = (HebeiPermitsEntity) o;

        if (id != that.id) return false;
        if (caseCode != null ? !caseCode.equals(that.caseCode) : that.caseCode != null) return false;
        if (casePermitsCode != null ? !casePermitsCode.equals(that.casePermitsCode) : that.casePermitsCode != null)
            return false;
        if (entpUscc != null ? !entpUscc.equals(that.entpUscc) : that.entpUscc != null) return false;
        if (applyCompanyName != null ? !applyCompanyName.equals(that.applyCompanyName) : that.applyCompanyName != null)
            return false;
        if (grantType != null ? !grantType.equals(that.grantType) : that.grantType != null) return false;
        if (grantProjectName != null ? !grantProjectName.equals(that.grantProjectName) : that.grantProjectName != null)
            return false;
        if (beginValidDate != null ? !beginValidDate.equals(that.beginValidDate) : that.beginValidDate != null)
            return false;
        if (endValidDate != null ? !endValidDate.equals(that.endValidDate) : that.endValidDate != null) return false;
        if (categoryName != null ? !categoryName.equals(that.categoryName) : that.categoryName != null) return false;
        if (applyName != null ? !applyName.equals(that.applyName) : that.applyName != null) return false;
        if (signatureDate != null ? !signatureDate.equals(that.signatureDate) : that.signatureDate != null)
            return false;
        if (signAddress != null ? !signAddress.equals(that.signAddress) : that.signAddress != null) return false;
        if (operationAddress != null ? !operationAddress.equals(that.operationAddress) : that.operationAddress != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + (caseCode != null ? caseCode.hashCode() : 0);
        result = 31 * result + (casePermitsCode != null ? casePermitsCode.hashCode() : 0);
        result = 31 * result + (entpUscc != null ? entpUscc.hashCode() : 0);
        result = 31 * result + (applyCompanyName != null ? applyCompanyName.hashCode() : 0);
        result = 31 * result + (grantType != null ? grantType.hashCode() : 0);
        result = 31 * result + (grantProjectName != null ? grantProjectName.hashCode() : 0);
        result = 31 * result + (beginValidDate != null ? beginValidDate.hashCode() : 0);
        result = 31 * result + (endValidDate != null ? endValidDate.hashCode() : 0);
        result = 31 * result + (categoryName != null ? categoryName.hashCode() : 0);
        result = 31 * result + (applyName != null ? applyName.hashCode() : 0);
        result = 31 * result + (signatureDate != null ? signatureDate.hashCode() : 0);
        result = 31 * result + (signAddress != null ? signAddress.hashCode() : 0);
        result = 31 * result + (operationAddress != null ? operationAddress.hashCode() : 0);
        return result;
    }
}
